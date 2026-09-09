import type { Metadata } from "next";
import { StadtLandDeuxApp } from "@/components/StadtLandDeuxApp";

export const metadata: Metadata = {
  title: "Stadt, Land, Deux",
  description:
    "Stadt-Land-Fluss in Echtzeit für zwei - gleichzeitig schreiben, eigene Kategorien, gewürfelter Buchstabe.",
};

export default function StadtLandDeuxPage() {
  return <StadtLandDeuxApp />;
}
