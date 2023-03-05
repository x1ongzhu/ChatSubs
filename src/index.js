const { chromium } = require("playwright");
const teserract = require("tesseract.js");

(async () => {
    const browser = await chromium.launch({
        headless: false,
        devtools: true,
        timeout: 0,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("load", (data) => {
        console.log("load");
    });
    // 导航到目标网页
    await page.goto("https://zimuku.pw/");

    const needVerify =
        (await (await page.getByText("网站访问认证页面")).count()) > 0;
    while (needVerify) {
        const verifyImg = await page.waitForSelector(".verifyimg");
        const base64 = await verifyImg.getAttribute("src");

        try {
            const result = await teserract.recognize(
                Buffer.from(base64.split(";base64,").pop(), "base64")
            );
            const text = result.data.text.trim();
            console.log(text);
            await page.locator("input[id=intext]").fill(text);
            await page.locator("input[type=submit]").click();
            console.log(await page.title());
        } catch (e) {
            console.log(e);
        }

        needVerify =
            (await (await page.getByText("网站访问认证页面")).count()) > 0;
    }
})();
