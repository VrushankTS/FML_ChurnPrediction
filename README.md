# Integrated Churn Prediction and Customer Segmentation Framework for Telco Business

This repository contains implementation of a framework that integrates churn prediction and customer segmentation process to provide telco operators with a complete churn analysis to better manage customer churn.

**Dataset**: https://www.kaggle.com/datasets/jpacse/datasets-for-churn-telecom

### Dataset Preprocessing

#### 1. Dataset Loading and Initial Inspection

- Loaded the original `cell2celltrain.csv` file
- The original dataset has 58 columns.
- Target Variable: Churn (Binary: Yes/No)

#### 2. Data Cleaning and Transformation

##### Handling Missing Values
- Filled 35 categorical missing values with mode (most frequent value)
- Filled 23 numerical missing values with mean

##### Categorical Variable Encoding
- Applied label encoding to categorical variables

##### Numerical Variable Processing
- Applied Min-Max scaling to normalize numerical features

## Churn Prediction

### Chi-square Score method
- Reduces the dimensionality of the dataset.
- Dropped columns before performing: Churn, CustomerID, ServiceArea
- Total of 20 attributes selected for churn prediction.
- Features: MadeCallToRetentionTeam, CreditRating, HandsetPrice, RetentionCalls, CurrentEquipmentDays, HandsetRefurbished, RetentionOffersAccepted, HandsetWebCapable, RespondsToMailOffers, BuysViaMailOrder, MonthlyMinutes, HandsetModels, OffPeakCallsInOut, AgeHH1, ReceivedCalls, Homeownership, Handsets, PeakCallsInOut, TotalRecurringCharge, AgeHH2

### Models evaluated
Six classification models were trained and evaluated:
- Logistic Regression
- Decision Tree
- Random Forest
- Naive Bayes
- AdaBoost
- XGBoost

In churn prediction, the primary metrics should be
- Recall on the churn class (catch as many churners as possible)
- F1-score (balance between precision and recall)
- AUC-PR (Precision-Recall AUC)

### Results

#### Imbalanced dataset

| Model | Accuracy | Precision | Recall | F1 | AUC |
|-------|----------|-----------|--------|----|-----|
| Logistic Regression | 0.5072 | 0.3297 | 0.7099 | 0.4502 | 0.5928 |
| Decision Tree | 0.4936 | **0.3329** | 0.7784 | 0.4664 | 0.6219 |
| Random Forest | 0.5855 | 0.3312 | 0.8529 | **0.4772** | 0.6418 |
| Naive Bayes | 0.6881 | 0.3312 | 0.8529 | **0.4772** | 0.5696 |
| AdaBoost | **0.7201** | 0.3324 | 0.8301 | 0.4747 | 0.6408 |
| XGBoost | 0.3581 | 0.3020 | **0.9593** | 0.4593 | **0.6477** |
| Stacking Ensemble | 0.4754 | 0.3327 | 0.8408 | 0.4767 | 0.6472 |

![image](https://github.com/user-attachments/assets/6674bf0d-d1ab-41f0-96e4-d68f8c4f1f4c)

#### SMOTEd dataset

| Model | Accuracy | Precision | Recall | F1 | AUC |
|-------|----------|-----------|--------|----|-----|
| Logistic Regression | 0.5120 | 0.5079 | **0.9872** | 0.6708 | 0.5978 |
| Decision Tree | 0.6384 | 0.6020 | 0.8321 | 0.6986 | 0.7449 |
| Random Forest | 0.5035 | 0.5957 | 0.8814 | 0.7109 | 0.7588 |
| Naive Bayes | 0.5646 | 0.5957 | 0.8814 | 0.7109 | 0.5847 |
| Adaboost | 0.6400 | 0.6382 | 0.6580 | 0.6480 | 0.6940 |
| XGBoost | **0.7221** | **0.7542** | 0.6646 | 0.7066 | **0.7991** |
| Stacking Ensemble | 0.6975 | 0.6731 | 0.7761 | **0.7209** | 0.7912 |

![image](https://github.com/user-attachments/assets/b8a939fe-0e51-4d5c-93df-8c65fac29337)


### Key Findings
- **Imbalanced dataset:** Ensemble models (XGBoost, Random Forest, and AdaBoost) performed best in terms of AUC and precision, while Naïve Bayes and Decision Tree showed better recall, indicating different trade-offs in churn prediction.
- **SMOTEd dataset:** Overall, ensemble models (XGBoost, Random Forest, and AdaBoost) outperformed traditional methods, with XGBoost emerging as the best-performing classifier.

## Customer Segmentation

### Bayesian Logistic Regression
- After performing the churn prediction, Bayesian Logistic Regression is used to conduct the factor analysis, aiming to find the reason behind churn, and provide some important factors for churn customer segmentation.
- Top 16 features: CurrentEquipmentDays, RetentionCalls, MadeCallToRetentionTeam, Handsets, TotalRecurringCharge, HandsetModels, RetentionOffersAccepted, ReceivedCalls, AgeHH1, MonthlyMinutes, HandsetRefurbished, RespondsToMailOffers, HandsetWebCapable, OffPeakCallsInOut, PeakCallsInOut, CreditRating

### K-means Clustering
- K-means clustering is an unsupervised machine learning algorithm used to group data points into clusters based on their similarity, aiming to minimize the distances between data points and their respective cluster centroids.
- **Elbow method:** It is a heuristic used to determine the optimal number of clusters (k) for K-means clustering.
- **Silhoutte score:** It is a metric used to evaluate the quality of clusters in clustering algorithms. A higher Silhouette Score indicates better clustering, with clear separation between clusters and strong cohesion within each cluster.

#### Results
- Optimal K=3
- Cluster 1: 10626 samples (72.23%)
- Cluster 2: 780 samples (5.30%)
- Cluster 3: 3305 samples (22.47%)

![image](https://github.com/user-attachments/assets/a7a70f12-e7e3-46bc-9ee2-23abb2bc4fee)
![image](https://github.com/user-attachments/assets/7ce1009f-a55c-4e1c-8be9-a7ced5255ab6)

### Cluster-Level Churn Driver Analysis
The heatmap below visualizes the top 10 features influencing churn, highlighting how each customer cluster differs in behavior and how those behaviors impact churn likelihood. The color represents the normalized average value of each feature within a cluster, while the annotation shows the corresponding Bayesian effect on churn odds (% change).

#### Key Interpretations
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

#### 📘 How to Read the Heatmap
- Rows: Top churn-driving features selected from a Bayesian logistic regression model.
- Columns: Clusters generated using KMeans on churned customers.
- Cell Color: Normalized feature mean (red = high, blue = low).
- Annotations: Feature's average z-score in the cluster + its % effect on churn (positive = increases churn, negative = decreases churn).

### Cluster-wise churn rate
The logistic regression model was trained and used to predict churn probabilities for the subset of customers who had already churned. The predicted churn probabilities were subsequently averaged across predefined customer segments.
- Cluster 1: 30.92%
- Cluster 2: 46.90%
- Cluster 3: 25.49%

# Running the Application

### 1. Configure Environment Variables

Create a file named `.env.local` inside the `frontend/` directory with the following content:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Adjust the URL if your FastAPI backend is running on a different address.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the frontend at [http://localhost:3000](http://localhost:3000).


### 3. Start the Backend

```bash
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python api/main.py
```

This starts the FastAPI backend at [http://localhost:8000](http://localhost:8000).
