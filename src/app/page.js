import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");   // พาไปหน้า login ทันที
}