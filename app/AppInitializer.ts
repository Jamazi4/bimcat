"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { AppDispatch } from "@/lib/store";

const AppInitializer = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUserLibraries());
  }, [dispatch]);

  return null;
};

export default AppInitializer;
