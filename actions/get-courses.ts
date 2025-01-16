import { Category, Course } from "@prisma/client";

import { getProgress } from "@/actions/get-process";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
    category: Category | null;
    chapters: { id: string }[];
    progress: number | null;
};

type GetCourses = {
    userId: string;
    title?: string;
    categoryId?: string;
};


export const GetCourses = async ({
    userId,
    title = "",
    categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
    try {
        const courses = await db.course.findMany({
            where: {
                isPublished: true,
                title: title ? { contains: title } : undefined,
                categoryId,
            },
            include: {
                category: true,
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
                purchases: {
                    where: {
                        userId,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Return early if no courses found
        if (!courses || courses.length === 0) {
            return [];
        }

        // Map over courses and add progress information
        const CoursesWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
            courses.map(async (course) => {
                const progressPercentage =
                    course.purchases.length > 0
                        ? await getProgress(userId, course.id)
                        : null;

                return {
                    ...course,
                    progress: progressPercentage,
                };
            })
        );

        return CoursesWithProgress;
    } catch (error) {
        console.error("[GET_COURSES]", error);
        throw new Error("Failed to fetch courses");
    }

}