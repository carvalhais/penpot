import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/WorkspacePage";

const timeoutToWait = 50

test.beforeEach(async ({ page }) => {
  await WorkspacePage.init(page);
  await WorkspacePage.mockConfigFlags(page, ["enable-feature-text-editor-v2"]);
});

test("Create a new text shape", async ({ page }) => {
  const textToPaste = "Lorem ipsum";
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("workspace/get-file-blank.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.page.keyboard.press("T");
  await page.waitForTimeout(timeoutToWait);
  await workspace.clickAndMove(190, 150, 300, 200);
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.type(textToPaste);

  const firstInline = await workspace.page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();

  expect(textContent).toBe(textToPaste);

  await workspace.page.keyboard.press("Escape");
});

test("Create a new text shape from pasting text", async ({ page, context }) => {
  const textToPaste = "Lorem ipsum";
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-blank.json");
  await workspace.mockRPC(
    "update-file?id=*",
    "text-editor/update-file.json",
  );
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await workspace.clickAt(190, 150);
  await page.waitForTimeout(timeoutToWait);
  await page.evaluate((textToPaste) => navigator.clipboard.writeText(textToPaste), textToPaste);
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("Control+V");
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe(textToPaste);
  await workspace.page.keyboard.press("Escape");
});

test("Create a new text shape from pasting text using context menu", async ({ page, context }) => {
  const textToPaste = "Lorem ipsum";
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-blank.json");
  await workspace.mockRPC(
    "update-file?id=*",
    "text-editor/update-file.json",
  );
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await workspace.clickAt(190, 150);
  await page.waitForTimeout(timeoutToWait);
  await page.evaluate((textToPaste) => navigator.clipboard.writeText(textToPaste), textToPaste);
  await page.waitForTimeout(timeoutToWait);
  await workspace.viewport.click({ button: "right" });
  await page.waitForTimeout(timeoutToWait);
  await page.getByText("PasteCtrlV").click();
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe(textToPaste);
  await workspace.page.keyboard.press("Escape");
})

test("Update an already created text shape by appending text", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(timeoutToWait);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("ArrowRight");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.type(" dolor sit amet")
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe("Lorem ipsum dolor sit amet");
  await workspace.page.keyboard.press("Escape");
});

test("Update an already created text shape by prepending text", async ({
  page,
}) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(timeoutToWait);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.type("Dolor sit amet ");
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe("Dolor sit amet Lorem ipsum");
  await workspace.page.keyboard.press("Escape");
});

test("Update an already created text shape by inserting text in between", async ({
  page,
}) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(timeoutToWait);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("ArrowLeft");
  for (let i = 0; i < 5; i++) {
    await workspace.page.keyboard.press("ArrowRight");
  }
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.type(" dolor sit amet");
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe("Lorem dolor sit amet ipsum");
  await workspace.page.keyboard.press("Escape");
});

test("Update a new text shape appending text by pasting text", async ({ page }) => {
  const textToPaste = " dolor sit amet";
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(timeoutToWait);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("ArrowRight");
  await page.waitForTimeout(timeoutToWait);
  await page.evaluate(
    (textToPaste) => navigator.clipboard.writeText(textToPaste),
    textToPaste,
  );
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("Control+V");
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe("Lorem ipsum dolor sit amet");
  await workspace.page.keyboard.press("Escape");
});

test("Update a new text shape prepending text by pasting text", async ({
  page,
}) => {
  const textToPaste = "Dolor sit amet ";
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(timeoutToWait);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(timeoutToWait);
  await page.evaluate(
    (textToPaste) => navigator.clipboard.writeText(textToPaste),
    textToPaste,
  );
  await page.waitForTimeout(timeoutToWait);
  await workspace.page.keyboard.press("Control+V");
  await page.waitForTimeout(timeoutToWait);
  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  const textContent = await firstInline.textContent();
  expect(textContent).toBe("Dolor sit amet Lorem ipsum");
  await workspace.page.keyboard.press("Escape");
});

test.skip("BUG 11552 - Apply styles to the current caret", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-11552.json");
  await workspace.mockRPC(
    "update-file?id=*",
    "text-editor/update-file-11552.json",
  );
  await workspace.goToWorkspace({
    fileId: "238a17e0-75ff-8075-8006-934586ea2230",
    pageId: "238a17e0-75ff-8075-8006-934586ea2231",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await workspace.clickLeafLayer("Lorem ipsum");

  const fontSizeInput = workspace.rightSidebar.getByRole("textbox", {
    name: "Font Size",
  });
  await expect(fontSizeInput).toBeVisible();

  await workspace.page.keyboard.press("Enter");
  await workspace.page.keyboard.press("ArrowRight");

  await fontSizeInput.fill("36");

  await workspace.clickLeafLayer("Lorem ipsum");

  // display Mixed placeholder
  await expect(fontSizeInput).toHaveValue("");
  await expect(fontSizeInput).toHaveAttribute("placeholder", "Mixed");
});
