import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies the core functionality of the Simple Roulette Maker.
    """
    # 1. Navigate to the app
    page.goto("http://localhost:5173/")

    # 2. Add a new item
    add_item_input = page.get_by_placeholder("新しい項目")
    expect(add_item_input).to_be_visible()
    add_item_input.fill("うどん")

    add_button = page.get_by_role("button", name="追加")
    add_button.click()

    # 3. Verify the item was added
    new_item = page.get_by_text("うどん")
    expect(new_item).to_be_visible()

    # 4. Start the roulette
    start_button = page.get_by_role("button", name="スタート")
    start_button.click()

    # 5. Wait for the result
    # We locate the element by its test id and then wait for the text to match the result format.
    result_area = page.get_by_test_id("result-area")
    expect(result_area).to_have_text(re.compile(r'結果: .+'), timeout=10000)

    # 6. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()
    print("Verification script finished and screenshot taken.")
