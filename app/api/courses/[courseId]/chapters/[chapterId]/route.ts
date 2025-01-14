import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const Video = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET
});

export async function DELETE(
    req:Request,
    { params }: { params: { courseId: string; chapterId: string } }
) {
    try {
        const { userId } =  await auth();
        const { courseId } = await params;
        const { chapterId } = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                    userId: userId,
                }
            });
        
        if (!ownCourse) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId,
                },
            });

        if (!chapter) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if(chapter.videoUrl) {
            const existingMuxData = await db.muxData.findFirst({
                where: {
                   chapterId: chapterId, 
                }
            });

            if (existingMuxData) {
                await Video.video.assets.delete(existingMuxData.assetId);
                await db.muxData.delete({
                    where: {
                        id: existingMuxData.id,
                    }
                });
            }
        }

        const deletedChapter = await db.chapter.delete({
            where: {
                id: chapterId
            }
        });

        const publishedChaptersInCourse = await db.chapter.findMany({
            where: {
                courseId: courseId,
                isPublished: true
            }
        });

        if (!publishedChaptersInCourse.length) {
            await db.course.update({
                where: {
                    id: params.courseId,
                },
                data: {
                    isPublished: false,
                }
            });
        }

        return NextResponse.json(deletedChapter);

    } catch (error) {
        console.log("[CHAPTER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
    
}

export async function PATCH(
    req:Request,
    { params }: { params: { courseId: string; chapterId: string } }
) {
    try {
        const { userId } =  await auth();
        const { isPublished, ...values} = await req.json();
        const { courseId } = await params;
        const { chapterId } = await params;

        
                if (!userId) {
                    return new NextResponse("Unauthorized", { status: 401 });
                }
                
        
                const ownCourse = await db.course.findUnique({
                    where: {
                        id: courseId,
                            userId: userId,
                        }
                    });
                
                if (!ownCourse) {
                    return new NextResponse("Unauthorized", { status: 401 });
                }

                const chapter = await db.chapter.update({
                    where: {
                        id: chapterId,
                        courseId: courseId,
                        },
                        data: {
                            ...values,
                        }
                    });


                if (values.videoUrl) {
                    const existingMuxData = await db.muxData.findFirst({
                        where: {
                            chapterId: chapterId,
                        }
                    });

                    if (existingMuxData) {
                        await Video.video.assets.delete(existingMuxData.assetId);
                        await db.muxData.delete({
                            where: {
                                id: existingMuxData.id,
                            }
                        });
                    }


                    const asset = await Video.video.assets.create({
                        input: values.videoUrl,
                        playback_policy: ["public"],
                        video_quality: 'basic',
                    });

                    await db.muxData.create({
                        data: {
                            chapterId: chapterId,
                            assetId: asset.id,
                            playbackId: asset.playback_ids?.[0]?.id,
                        }
                    });
                }

                return NextResponse.json(chapter);

    } catch (error) {
        console.log("[COURSES_CHAPTER_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}