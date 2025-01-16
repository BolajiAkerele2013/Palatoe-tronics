import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "./_component/chapter-title-form";
import { ChapterDescriptionForm } from "./_component/chapter-description-form copy";
import { ChapterAccessForm } from "./_component/chapter-access-form";
import { ChapterVideoForm } from "./_component/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterActions } from "./_component/chapter-actions";

const ChapterIdPage = async ({
    params
}: {
    params: { courseId: string; chapterId: string }
}) => {
    const { userId } = await auth();
    const resolvedParams = await params; 

    if (!userId) {
        return redirect("/");
    }

    const chapter = await db.chapter.findUnique({
        where: {
            id:resolvedParams.chapterId,
            courseId: resolvedParams.courseId
        },
        include: {
            muxData: true,
        },
    });

    if (!chapter) {
        return redirect("/")
    }

    const requiredFields = [
        chapter.title,
        chapter.description,
        chapter.videoUrl,
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean);

    return ( 
        <>
        {!chapter.isPublished && (
            <Banner 
                variant="warning"
                label="This chapter is unpublished. It will not be visible in the course"
            />
        )}
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="w-full">
                    <Link
                        href={`/teacher/courses/${resolvedParams.courseId}`}
                        className="flex items-center text-sm hover:opacity-75 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course setup
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">
                                Chapter Creation
                            </h1>
                            <span className="text-sm text-slate-700">
                                Complete all fields {completionText}
                            </span>
                        </div>
                        <ChapterActions
                            disabled={!isComplete}
                            courseId={resolvedParams.courseId}
                            chapterId={resolvedParams.chapterId}
                            isPublished={chapter.isPublished}
                        />
                    </div>
                </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="space-y-4">
                    <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={LayoutDashboard}/>
                        <h2 className="text-xl">
                            Customize your chapter
                        </h2>

                    </div>
                    <ChapterTitleForm 
                    initialData={chapter}
                    courseId={resolvedParams.courseId}
                    chapterId={resolvedParams.chapterId}
                    />
                    <ChapterDescriptionForm
                        initialData={chapter}
                        courseId={resolvedParams.courseId}
                        chapterId={resolvedParams.chapterId} 
                    />
                </div>
                <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={Eye} />
                    <h2 className="text-xl">
                        Access Setting
                    </h2>
                </div>
                <ChapterAccessForm
                    initialData={chapter}
                    courseId={resolvedParams.courseId}
                    chapterId={resolvedParams.chapterId}
                />
                </div>
                </div>
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={Video} />
                        <h2 className="text-xl">
                        Add a video
                        </h2>
                    </div>
                    <ChapterVideoForm 
                        initialData={chapter}
                        courseId={resolvedParams.courseId}
                        chapterId={resolvedParams.chapterId}
                    />
                </div>
            </div>
        </div>
        </>
     );
}
 
export default ChapterIdPage;