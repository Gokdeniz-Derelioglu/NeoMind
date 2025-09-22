# main.py
from job_recommendation import (
    PREDICT_XLSX,
    _pred_df, _ranked_scores,   # internal caches we need to clear
    random_block_job_objects,
)

def main():
    # --- 1) tell the module to use your new file -----------------
    PREDICT_XLSX = "prediction.xlsx"  # same folder
    _pred_df.cache_clear()        # wipe the old cached DataFrame
    _ranked_scores.cache_clear()  # wipe cached scores

    # --- 2) get three random consecutive jobs --------------------
    jobs = random_block_job_objects(n=3)
    # --- 3) pretty-print the result ------------------------------
    for idx, job in enumerate(jobs, 1):
        print(f"\n★ Recommendation #{idx}")
        print(f"  Company : {job['name']}")
        print(f"  Role    : {job['position']} ({job['type']})")
        print(f"  Score   : {job['aiScore']}")
        print(f"  Salary  : {job['salary']}")
        print(f"  Posted  : {job['posted']}")
        print(f"  Skills  : {', '.join(eval(job['skills']))}")
        print("-" * 40)
        

if __name__ == "__main__":
    main()
