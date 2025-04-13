# FML_ChurnPrediction

This repository contains implementation of the above research paper, which provides framework that integrates churn prediction and customer segmentation process to provide telco operators with a complete churn analysis to better manage customer churn.

## Cluster-Level Churn Driver Analysis
The heatmap below visualizes the top 10 features influencing churn, highlighting how each customer cluster differs in behavior and how those behaviors impact churn likelihood. The color represents the normalized average value of each feature within a cluster, while the annotation shows the corresponding Bayesian effect on churn odds (% change).

### 📊 Key Interpretations
- Cluster 0 appears to have the highest churn risk:
  - Customers tend to have older equipment (+292% effect on churn), more handsets, and more handset models — all strong churn drivers.
  - They also accept fewer retention offers and receive fewer calls, further increasing churn likelihood.

- Cluster 2 shows similar churn risk to Cluster 0, with:
  - High values for CurrentEquipmentDays, Handsets, and HandsetModels, all of which are positively associated with churn.
  - Lower engagement with the retention team and fewer accepted offers, reinforcing churn propensity.

- Cluster 1 is likely the lowest-risk cluster:
  - This group shows high retention engagement — more calls to and from the retention team, and more offers accepted — features associated with lower churn probability.
  - They also tend to have newer equipment and fewer handsets, both contributing to churn reduction.

### 📘 How to Read the Heatmap
- Rows: Top churn-driving features selected from a Bayesian logistic regression model.
- Columns: Clusters generated using KMeans on churned customers.
- Cell Color: Normalized feature mean (red = high, blue = low).
- Annotations: Feature's average z-score in the cluster + its % effect on churn (positive = increases churn, negative = decreases churn).
