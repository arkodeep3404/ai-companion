import { Categories } from "@/components/categories";
import { Companions } from "@/components/companions";
import { SearchInput } from "@/components/search-input";
import getCurrentUser from "@/lib/getCurrentUser";
import prismadb from "@/lib/prismadb";
import { cookies } from "next/headers";

interface PageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = getCurrentUser(token);
  const userId = currentUser.id;

  let data;
  if (userId) {
    data = await prismadb.companion.findMany({
      where: {
        categoryId: searchParams.categoryId,
        name: {
          contains: searchParams.name,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            messages: {
              where: {
                userId,
              },
            },
          },
        },
      },
    });
  } else {
    data = await prismadb.companion.findMany({
      where: {
        categoryId: searchParams.categoryId,
        name: {
          contains: searchParams.name,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={categories} />
      <Companions data={data} />
    </div>
  );
};

export default Page;
