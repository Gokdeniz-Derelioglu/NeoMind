from scraper import scrape_glassdoor_jobs

# Example usage
search_page = "https://www.glassdoor.com/Job/software-engineer-jobs-SRCH_KO0,17.htm"
scrape_glassdoor_jobs(search_page, pages=5, output_csv="software_engineer_jobs.csv")
