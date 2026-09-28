import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Checkout", description: "Purchase Behind the Mask directly from Dr. Robert Sakulanda.", path: "/checkout" });

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  const format = (await searchParams).format === "hardcover" ? "HARDCOVER" : "PAPERBACK";
  return <CheckoutForm initialFormat={format} />;
}
