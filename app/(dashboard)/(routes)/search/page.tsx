// import { db } from "@/lib/db";
// import { Categories } from "./_components/categories";
// import { SearchInput } from "@/components/search-input";
// import { GetCourses } from "@/actions/get-courses";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { CoursesList } from "@/components/courses-list";

// const SearchPage = async ({
//   searchParams,
// }: {
//   searchParams: { title?: string; categoryId?: string };
// }) => {
//   const { userId } = await auth();

//   // Redirect if no user is authenticated
//   if (!userId) {
//     return redirect("/");
//   }

//   // Extract `title` and `categoryId` from searchParams with defaults
//   const { title = "", categoryId = "" } = searchParams || {};

//   // Fetch categories from the database
//   const categories = await db.category.findMany({
//     orderBy: {
//       name: "asc",
//     },
//   });

//   // Fetch courses based on the searchParams and userId
//   const courses = await GetCourses({
//     userId,
//     title,
//     categoryId,
//   });

//   return (
//     <>
//       <div className="px-6 pt-6 md:hidden md:mb-0 block">
//         <SearchInput />
//       </div>
//       <div className="p-6 space-y-4">
//         <Categories items={categories} />
//         <CoursesList items={courses} />
//       </div>
//     </>
//   );
// };

// export default SearchPage;
