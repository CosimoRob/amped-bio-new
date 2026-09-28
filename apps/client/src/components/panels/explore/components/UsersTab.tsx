import React, { useState } from "react";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import UserSkeleton from "./UserSkeleton";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@repo/ui";
import { htmlToPlainText } from "@repo/constants";

// Define filter and sort types
type UserFilter = "all" | "active-7-days" | "has-creator-pool";
type UserSort = "newest" | "name-asc" | "name-desc";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  banner: string | null;
  bio: string;
  category: string;
}

interface UsersTabProps {
  searchQuery: string;
  userFilter: UserFilter;
  userSort: UserSort;
  handleViewProfile: (username: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  searchQuery,
  userFilter,
  userSort,
  handleViewProfile,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20); // 20 users per page maximum

  const { data, isLoading } = useQuery(
    trpc.user.getUsers.queryOptions({
      search: searchQuery,
      filter: userFilter,
      sort: userSort,
      page: currentPage,
      limit: limit,
    })
  );

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to show in pagination controls
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <UserSkeleton key={index} />)
        ) : users && users.length > 0 ? (
          users.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {user.banner ? (
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <img
                    src={user.banner}
                    alt={`${user.displayName} banner`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
              ) : (
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative shadow-inner"></div>
              )}

              <div className="p-6 relative">
                <div className="absolute -top-12 left-6">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover flex items-center justify-center bg-gray-200 text-gray-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {htmlToPlainText(user.bio)}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(user.username)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 col-span-full">No users found.</div>
        )}
      </div>

      {/* Pagination Controls */}
      {total > limit && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{Math.min((currentPage - 1) * limit + 1, total)}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
