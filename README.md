# Integrated Churn Prediction and Customer Segmentation Framework for Telco Business

This repository contains implementation of the above research paper, which provides framework that integrates churn prediction and customer segmentation process to provide telco operators with a complete churn analysis to better manage customer churn.

**Dataset**: https://www.kaggle.com/datasets/jpacse/datasets-for-churn-telecom

## Dataset Preprocessing

### 1. Dataset Loading and Initial Inspection

- Loaded the original `cell2celltrain.csv` file
- The original dataset has 58 columns.
- Target Variable: Churn (Binary: Yes/No)

### 2. Data Cleaning and Transformation

#### Handling Missing Values
- Filled 35 categorical missing values with mode (most frequent value)
- Filled 23 numerical missing values with mean

#### Categorical Variable Encoding:
- Applied label encoding to categorical variables

#### Numerical Variable Processing
- Applied Min-Max scaling to normalize numerical features

## Chi-square Score method
- Reduces the dimensionality of the dataset.
- Dropped columns: Churn, CustomerID, ServiceArea
- Total of 20 attributes selected for churn prediction.
- Features: MadeCallToRetentionTeam, CreditRating, HandsetPrice, RetentionCalls, CurrentEquipmentDays, HandsetRefurbished, RetentionOffersAccepted, HandsetWebCapable, RespondsToMailOffers, BuysViaMailOrder, MonthlyMinutes, HandsetModels, OffPeakCallsInOut, AgeHH1, ReceivedCalls, Homeownership, Handsets, 	PeakCallsInOut, TotalRecurringCharge, AgeHH2

## Models evaluated
Six classification models were trained and evaluated:
- Logistic Regression
- Decision Tree
- Random Forest
- Naive Bayes
- AdaBoost
- XGBoost

### Results

| Model | Accuracy | Precision | Recall | F1 | AUC |
|-------|----------|-----------|--------|----|-----|
| Logistic Regression | 0.7134 | 0.4189 | 0.0214 | 0.0407 | 0.5920 |
| Decision Tree | 0.7148 | 0.4909 | 0.0930 | 0.1564 | 0.6159 |
| Random Forest | 0.7207 | 0.4831 | 0.1475 | 0.2260 | 0.6431 |
| Naive Bayes | 0.6881 | 0.4831 | 0.1475 | 0.2260 | 0.5696 |
| Random Forest | 0.7187 | 0.6172 | 0.0272 | 0.0521 | 0.6249 |
| Naive Bayes | 0.7206 | 0.5702 | 0.0686 | 0.1224 | 0.6449 |

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

![image](https://github.com/user-attachments/assets/7c88f6f2-5ebf-4ccd-b4bc-37c4c27d0cfd)

### 📘 How to Read the Heatmap
- Rows: Top churn-driving features selected from a Bayesian logistic regression model.
- Columns: Clusters generated using KMeans on churned customers.
- Cell Color: Normalized feature mean (red = high, blue = low).
- Annotations: Feature's average z-score in the cluster + its % effect on churn (positive = increases churn, negative = decreases churn).
