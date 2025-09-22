from job_recommendation import random_block_jobs

three_random = random_block_jobs()   # e.g. jobs ranked #12-14
for firm, score in three_random:
    print(f"{firm:<25} | {score:.3f}")
