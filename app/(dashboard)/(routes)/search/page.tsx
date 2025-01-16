import { db } from "@/lib/db";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/search-input";
import { GetCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";

interface SearchPageProps {
    searchParams: {
        title?: string;
        categoryId?: string;
    };
}

const SearchPage = async ({
    searchParams
}: SearchPageProps) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }
    const { title = "", categoryId = "" } = searchParams || {};

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    });

    // Fetch courses based on the searchParams and userId
    const courses = await GetCourses({
        userId,
        title,
        categoryId,
    });

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <Categories 
                    items={categories} 
                />
                <CoursesList items={courses} />
            </div>
        </>
    );
};

// Use the nextjs route params (if available) for the page
export const getServerSideProps = async ({ query }: any) => {
    // You can add any logic to handle searchParams here if needed
    const { title, categoryId } = query; // extract from query string

    return {
        props: {
            searchParams: {
                title: title || "",
                categoryId: categoryId || "",
            },
        },
    };
};

export default SearchPage;
