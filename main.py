from job_recommendation import push_job_recommendations

# `GOOGLE_APPLICATION_CREDENTIALS` must point to your serviceAccount.json
jobs = push_job_recommendations(uid="xxxxxxxxxxxxxxxxx", n=3)  # returns the same list
