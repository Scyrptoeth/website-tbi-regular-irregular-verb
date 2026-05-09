import { expect, test } from "@playwright/test";

test("dashboard exposes the Persiapantubel learning shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "TBI - Regular and Irregular Verb" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByText("Verb Bank")).toBeVisible();
});

test("search finds verb forms and Indonesian meaning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pencarian/i }).click();
  await page.getByRole("searchbox", { name: "Cari verb" }).fill("went");

  await expect(page.getByText("go - went - gone | pergi")).toBeVisible();
});

test("material and flipcard share package rail behavior", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { exact: true, name: "Materi" }).click();

  await expect(page.getByRole("heading", { name: "Belajar bentuk verb" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Verb Forms 01/i })).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Flipcard" }).click();
  await page.getByRole("button", { name: /Tap untuk lihat bentuk lengkap/i }).click();

  await expect(page.getByText("accept - accepted - accepted")).toBeVisible();
});

test("test package saves answers and locks after final submit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Tes$/i }).click();
  await page.getByRole("button", { name: /go - went - gone - pergi/i }).click();
  await page.getByRole("button", { name: /Submit final/i }).click();

  await expect(page.getByText("Skor: 1/5")).toBeVisible();
  await expect(page.getByText(/Jawaban benar: D/i)).toBeVisible();
});
