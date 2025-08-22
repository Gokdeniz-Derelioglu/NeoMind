import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv
import urllib.parse

def scrape_indeed_jobs(search_term, location, num_jobs):
    options = uc.ChromeOptions()
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/114.0.0.0 Safari/537.36"
    )
    # Allow popups by default
    prefs = {
        "profile.default_content_setting_values.popups": 1,
        "profile.default_content_setting_values.notifications": 1,
    }
    options.add_experimental_option("prefs", prefs)

    driver = uc.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    base_url = "https://www.indeed.com/jobs"
    search_term_enc = urllib.parse.quote_plus(search_term)
    location_enc = urllib.parse.quote_plus(location)

    jobs = []
    start = 0

    def clean_text(text):
        # Remove problematic characters that break CSV formatting
        if not text:
            return ""
        return (
            text.replace('\n', ' ')
                .replace('\r', ' ')
                .replace('\t', ' ')
                .replace('"', "'")
                .strip()
        )

    def get_job_details(job_link):
        if not job_link:
            return ""
        try:
            driver.execute_script("window.open('');")
            # Wait until new tab opens
            for _ in range(10):
                if len(driver.window_handles) > 1:
                    break
                time.sleep(0.5)
            else:
                print("Failed to open new tab for job details.")
                return ""

            driver.switch_to.window(driver.window_handles[-1])
            driver.get(job_link)
            time.sleep(2)  # Let page load

            try:
                detailed_desc = driver.find_element(By.ID, "jobDescriptionText").text
                detailed_desc = clean_text(detailed_desc)
            except:
                detailed_desc = ""
        except Exception as e:
            print(f"Error fetching job details page: {e}")
            detailed_desc = ""
        finally:
            if len(driver.window_handles) > 1:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
        return detailed_desc


    while len(jobs) < num_jobs:
        url = f"{base_url}?q={search_term_enc}&l={location_enc}&start={start}"
        driver.get(url)
        time.sleep(3)

        try:
            wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.tapItem")))
        except:
            print("No job listings found or possible captcha.")
            break

        cards = driver.find_elements(By.CSS_SELECTOR, "div.tapItem")
        if not cards:
            print("No job cards found on this page.")
            break

        for card in cards:
            if len(jobs) >= num_jobs:
                break

            # Title extraction
            title = ""
            try:
                spans = card.find_elements(By.CSS_SELECTOR, "h2.jobTitle > span")
                if len(spans) == 1:
                    title = spans[0].text
                elif len(spans) > 1 and spans[0].text.lower() == "new":
                    title = spans[1].text
                else:
                    title = spans[0].text
                title = clean_text(title)
            except:
                pass

            # Company extraction
            company = ""
            try:
                company = card.find_element(By.CSS_SELECTOR, "span.companyName").text
            except:
                try:
                    company = card.find_element(By.CSS_SELECTOR, "span.company").text
                except:
                    pass
            company = clean_text(company)

            # Location extraction
            loc = ""
            try:
                loc = card.find_element(By.CSS_SELECTOR, "div.companyLocation").text
            except:
                try:
                    loc = card.find_element(By.CSS_SELECTOR, "span.location").text
                except:
                    pass
            loc = clean_text(loc)

            # Salary extraction
            salary = ""
            try:
                salary = card.find_element(By.CSS_SELECTOR, "div.metadata.salary-snippet-container").text
            except:
                try:
                    salary = card.find_element(By.CSS_SELECTOR, "span.salary-snippet").text
                except:
                    pass
            salary = clean_text(salary)

            # Summary extraction
            summary = ""
            try:
                summary = card.find_element(By.CSS_SELECTOR, "div.job-snippet").text
                summary = clean_text(summary)
            except:
                pass

            # Link extraction
            link = ""
            try:
                link = card.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
            except:
                pass

            # If title or summary missing, try to get detailed description from job page
            if (not title or not summary) and link:
                detailed_desc = get_job_details(link)
                if not summary:
                    summary = detailed_desc

            jobs.append([title, company, loc, salary, summary, link])

        start += 10
        time.sleep(1)

    driver.quit()

    # Write CSV with quoting to handle commas/newlines properly
    with open("indeed_jobs.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL, quotechar='"')
        writer.writerow(["Title", "Company", "Location", "Salary", "Summary", "Link"])
        writer.writerows(jobs)

    print(f"✅ Saved {len(jobs)} jobs to indeed_jobs.csv")

# Example usage:
scrape_indeed_jobs("Software Engineer", "United States", 50)
