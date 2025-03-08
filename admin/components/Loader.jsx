import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center mt-6 w-screen h-screen fixed -top-6 left-0 bg-gray-900/20 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 border-solid z-[60] relative"></div>
    </div>
  );
};

export default Loader;
