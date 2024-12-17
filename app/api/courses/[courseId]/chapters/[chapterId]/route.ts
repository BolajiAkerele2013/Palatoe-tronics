import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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


                //TODO: Handle Video Upload

                return NextResponse.json(chapter);

    } catch (error) {
        //console.log("[COURSES_CHAPTER_ID]", error);
        //console.log("Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}