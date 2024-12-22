"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabNavigation() {
  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
