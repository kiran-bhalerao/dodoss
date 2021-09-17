import { FC } from "react";
import Avatar from "src/assets/avatar.png";

// https://www.flaticon.com/packs/cinema-47?word=avatar

export const Home: FC = () => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-72 bg-light-gray shadow pl-8 pt-8 pb-4">
        <p className="font-bold text-2xl text-gray-800">💨 DoDo</p>
        <div className="flex flex-col flex-auto mt-8">
          <div className="flex px-2 py-2 my-2 border-r-4 border-purple-600  cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 26 26"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <p className="font-bold text-gray-500 pl-2">Dashboard</p>
          </div>
          <div className="flex px-2 py-2 my-3 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 26 26"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="font-bold text-gray-500 pl-2">Marketplace</p>
          </div>

          <div className="flex px-2 py-2 my-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 26 26"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-bold text-gray-500 pl-2">Calendar</p>
          </div>
          <div className="flex px-2 py-2 my-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 26 26"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="font-bold text-gray-500 pl-2">Chat</p>
          </div>
          <div className="flex mt-auto px-2 py-3 mr-8 bg-purple-600 hover:shadow-md transition duration-200 ease-in-out transform hover:-translate-y-1 cursor-pointer rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 26 26"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="font-bold text-white pl-2">Settings</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-8 py-4 flex-auto">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-600 text-5xl">Your Dodos</h1>
            <p className="mt-2 ml-1">
              Click{" "}
              <span className="px-4 border-dashed border-2 border-gray-300 pb-1 text-sm rounded-md mx-1">
                +
              </span>{" "}
              button to create your next DoDo..
            </p>
          </div>
          <img src={Avatar} alt="avatar" className="h-12 w-12" />
        </div>
        <div className="grid grid-cols-3 gap-8 flex-auto mt-8">
          <div className="flex flex-col">
            <div className="flex justify-between bg-light-gray rounded-md px-2 py-2">
              <p className="font-bold text-gray-600">To do</p>
              <p className="bg-purple-600 text-white h-6 w-6 text-center rounded-md">
                2
              </p>
            </div>
            <div className="flex-auto overflow-auto h-0">
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
            </div>
            <button className="border-dashed border-2 border-gray-200 hover:border-gray-300 py-1 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 m-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between bg-light-gray rounded-md px-2 py-2">
              <p className="font-bold text-gray-600">In Progress</p>
              <p className="bg-purple-600 text-white h-6 w-6 text-center rounded-md">
                5
              </p>
            </div>
            <div className="flex-auto overflow-auto h-0">
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
            </div>
            <button className="border-dashed border-2 border-gray-200 hover:border-gray-300 py-1 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between bg-light-gray rounded-md px-2 py-2">
              <p className="font-bold text-gray-600">Complete</p>
              <p className="bg-purple-600 text-white h-6 w-6 text-center rounded-md">
                1
              </p>
            </div>
            <div className="flex-auto overflow-auto h-0">
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
              <div className="border-dashed border-2 border-gray-100 h-36 mt-6 rounded-lg"></div>
            </div>
            <button className="border-dashed border-2 border-gray-200 hover:border-gray-300 py-1 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 m-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
