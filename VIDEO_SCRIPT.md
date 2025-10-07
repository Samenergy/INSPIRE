# Video Script: MSME Partnership Intelligence System
## From Web Scraping to AI-Powered Summarization

**Duration**: 8-10 minutes  
**Target Audience**: Technical recruiters, hiring managers, data science teams  
**Tone**: Professional, engaging, demo-focused

---

## [0:00 - 0:45] INTRODUCTION & HOOK

### Visual: Title slide with project logo/name

**[ON SCREEN TEXT]**
```
MSME Partnership Intelligence System
Scraping → Classification → Summarization
Built with FastAPI, Machine Learning, and Transformers
```

**[NARRATION]**

"Hi, I'm [Your Name], and today I'm going to show you a complete end-to-end machine learning system I built to help MSMEs—that's Micro, Small, and Medium Enterprises—discover partnership opportunities automatically.

Imagine you're a fintech company looking for MSME partnerships. Instead of manually reading hundreds of news articles every day, what if an AI system could scrape the web, classify articles by relevance, and give you concise summaries—all automatically?

That's exactly what this system does. Over the next 8 minutes, I'll walk you through:
- How we scrape data from multiple sources
- How we classify articles WITHOUT any labeled training data
- And how we generate intelligent summaries

Let's dive in!"

---

## [0:45 - 2:15] PROBLEM STATEMENT & ARCHITECTURE OVERVIEW

### Visual: Diagram showing the problem

**[ON SCREEN]**
```
Problem:
- 100s of company news articles daily
- Manual reading is time-consuming
- No way to filter by relevance
- Information overload

Solution:
- Automated web scraping
- AI-powered classification
- Intelligent summarization
```

**[NARRATION]**

"First, let's understand the problem. Companies trying to find partnership opportunities face information overload. There's news everywhere—LinkedIn, Google News, company blogs—but most of it isn't relevant to their specific objectives.

Traditional solutions would require hiring people to read all this content or building a classifier that needs thousands of labeled examples. Both are expensive and time-consuming.

So I built this."

### Visual: System architecture diagram

**[ON SCREEN - ARCHITECTURE DIAGRAM]**
```
┌─────────────┐
│   FastAPI   │  ← REST API (17 endpoints)
│   Backend   │
└──────┬──────┘
       │
   ┌───┴────────────────────────┐
   │                            │
┌──▼───────┐          ┌────────▼─────────┐
│ SCRAPING │          │ MACHINE LEARNING │
├──────────┤          ├──────────────────┤
│ SerpAPI  │          │ Classification   │
│ LinkedIn │          │ (F1: 0.951)      │
│ (Apify)  │          │                  │
└────┬─────┘          │ Summarization    │
     │                │ (Extractive)     │
     │                └────────┬─────────┘
     │                         │
     └─────────┬───────────────┘
               │
        ┌──────▼───────┐
        │   MySQL DB   │
        │ + File Store │
        └──────────────┘
```

**[NARRATION]**

"The system has three main components:

One: A FastAPI backend with 17 REST endpoints that orchestrate everything.

Two: Multi-source web scraping using SerpAPI for Google News and Apify for LinkedIn posts.

Three: Machine learning models—a transformer-based classifier with 95% accuracy and an enhanced summarization engine.

Everything is stored in MySQL for persistence, and we export results as CSV files for easy analysis.

Now let me show you how each component works."

---

## [2:15 - 4:00] PART 1: WEB SCRAPING

### Visual: Code editor showing scraping endpoints

**[ON SCREEN]**
```python
# API Endpoint Example
POST /api/v1/scrape
{
  "name": "MTN Rwanda",
  "location": "Rwanda"
}
```

**[NARRATION]**

"Let's start with scraping. I've implemented two complementary approaches.

First, comprehensive company scraping using SerpAPI. When you send a POST request with just a company name and location, the system:
- Searches Google News for recent articles
- Extracts LinkedIn URLs automatically
- Collects blog posts and press releases
- Stores everything in a structured format"

### Visual: Live demo or screen recording of Swagger UI

**[DEMO - SHOW IN REAL-TIME]**
1. Navigate to http://localhost:8000/docs
2. Open POST /api/v1/scrape
3. Enter company details
4. Execute request
5. Show response with scraped articles

**[NARRATION]**

"Here's what that looks like in action. I'm using the interactive Swagger documentation. Let me scrape data for MTN Rwanda...

[Wait for response]

And there we go! In about 3 seconds, we've collected 15 news articles, including titles, URLs, content, and metadata. Notice we also found their LinkedIn URL automatically.

The second scraping method focuses specifically on LinkedIn."

### Visual: LinkedIn scraping endpoint

**[ON SCREEN]**
```python
POST /api/v1/apify/scrape
{
  "linkedin_url": "https://linkedin.com/company/mtn/posts/"
}
```

**[NARRATION]**

"Using Apify's LinkedIn scraper, we can extract company posts, announcements, and thought leadership content. This gives us a different perspective—more about what the company is actively communicating versus what others are writing about them.

All of this data gets stored in MySQL with a normalized schema, and we automatically export it as CSV files with timestamps."

### Visual: Show CSV export file

**[ON SCREEN]** - Open the CSV file briefly
```
mtn_rwanda_news_articles_20251007_230315.csv
779 rows × 8 columns
```

**[NARRATION]**

"You can see here we've scraped nearly 800 articles for MTN Rwanda. But here's the thing—most of these aren't relevant to our specific partnership objectives. That's where classification comes in."

---

## [4:00 - 6:15] PART 2: CLASSIFICATION WITHOUT LABELS

### Visual: Classification concept diagram

**[ON SCREEN]**
```
Challenge: No labeled training data!

Traditional ML:
❌ Need 1000s of labeled examples
❌ Expensive human annotation
❌ Weeks of data collection

Our Solution: Weak Supervision
✅ Zero labeled examples needed
✅ Semantic similarity to objectives
✅ Ready in minutes
```

**[NARRATION]**

"Now here's where it gets interesting. Most classification systems require thousands of labeled examples. You'd need to hire people to read and label articles as 'relevant' or 'not relevant.' That's expensive and slow.

Instead, I used something called weak supervision. The idea is brilliant—we let the machine learning model learn from semantic similarity to company objectives, not from human labels."

### Visual: Technical architecture of classification

**[ON SCREEN]**
```
Classification Pipeline:

1. Text Input
   "MTN launches mobile money service..."

2. SentenceTransformer Embeddings
   all-MiniLM-L6-v2 → [384 dimensions]

3. Semantic Similarity
   Compare to: "We seek fintech partnerships..."
   Similarity: 0.73

4. Keyword Boosting
   "mobile money" (+0.15)
   "fintech" (+0.10)
   → Final score: 0.88

5. Classification
   Directly Relevant ✓
```

**[NARRATION]**

"Here's how it works step by step:

First, we take the article text and convert it to a 384-dimensional embedding using a pre-trained SentenceTransformer model. This captures the semantic meaning of the text.

Second, we compare this embedding to the company's partnership objectives using cosine similarity. High similarity means the article is talking about similar concepts.

Third, we apply keyword boosting. If the article mentions 'fintech,' 'mobile money,' or 'digital payments'—terms directly relevant to our objective—we boost the score. If it mentions off-topic keywords like 'agriculture' or 'healthcare,' we penalize it.

Finally, we classify the article into three categories: Directly Relevant, Indirectly Useful, or Not Relevant."

### Visual: Demo of classification endpoint

**[DEMO - SHOW CLASSIFICATION]**
```python
POST /api/v1/advanced/classify-upload
- Upload CSV file
- Enter objective: "We provide fintech solutions..."
- Show results
```

**[NARRATION]**

"Let me show you this in action. I'll upload our 779 articles and provide a partnership objective...

[Upload file, set objective]

And look at these results! Out of 779 articles:
- 2 are Directly Relevant (0.3%)
- 52 are Indirectly Useful (6.7%)
- 725 are Not Relevant (93%)

Instead of reading 779 articles, we can now focus on just 54 that matter. Each result includes confidence scores—see this one has 0.94 confidence, meaning the model is very certain.

And here's the best part: I tested this model against two alternatives—Random Forest and Logistic Regression. The Logistic Regression model achieved 95.2% accuracy with an F1-score of 0.951. That's better than many supervised models!"

### Visual: Model performance comparison

**[ON SCREEN]**
```
Model Performance:

Random Forest:
├─ Accuracy:  85.5%
├─ Precision: 0.877
└─ F1-Score:  0.810

Logistic Regression: ★ WINNER
├─ Accuracy:  95.2%
├─ Precision: 0.951
└─ F1-Score:  0.951

Training time: 2 minutes
No labeled data required!
```

---

## [6:15 - 8:00] PART 3: INTELLIGENT SUMMARIZATION

### Visual: Summarization concept

**[ON SCREEN]**
```
Problem: Relevant articles are still long

Example:
Original: 1,500 words, 8-minute read
Summary:  100 words, 30-second read
Compression: 93%
```

**[NARRATION]**

"Okay, so we've filtered down to 54 relevant articles. But each article is still 500-1500 words. We need summaries.

I built an enhanced extractive summarization system that doesn't just extract random sentences—it intelligently selects the most important ones."

### Visual: Summarization pipeline

**[ON SCREEN]**
```
Summarization Pipeline:

1. Sentence Tokenization
   Split article into sentences

2. TF-IDF Scoring
   Calculate term importance

3. Named Entity Recognition
   Identify companies, people, locations
   → Boost sentences with entities

4. Numerical Data Detection
   Find metrics, percentages, money
   → Prioritize quantitative info

5. Domain Keywords
   Business terms: "partnership", "revenue"
   → Increase relevance score

6. Sentence Ranking
   Select top 3 sentences
```

**[NARRATION]**

"The summarization algorithm works like this:

First, we split the article into sentences and calculate TF-IDF scores to identify important terms.

Second, we use Named Entity Recognition to find mentions of companies, people, and locations. Sentences with entities get priority because they contain concrete information.

Third, we detect numerical data—revenue figures, percentages, growth metrics. These quantitative facts are often the most valuable.

Fourth, we boost sentences containing domain-specific keywords like 'partnership,' 'expansion,' or 'investment.'

Finally, we rank all sentences and select the top 3 to create a concise, informative summary."

### Visual: Demo of summarization

**[DEMO - SHOW SUMMARIZATION]**
```python
POST /api/v1/summarization/summarize-text

Input: Long article about MTN's digital payments
Output: 3-sentence summary
```

**[NARRATION]**

"Let me demonstrate. Here's a 1,200-word article about MTN's digital payment expansion. Watch what happens when we summarize it...

[Execute request]

Perfect! We got a 3-sentence summary that captures:
- The main announcement (MTN launching mobile money)
- Key metrics (2 million users targeted)
- Strategic importance (financial inclusion focus)

Original length: 1,200 words. Summary: 85 words. That's a 93% reduction while preserving all the critical information.

And here's the power move: I also built a combined endpoint that classifies AND summarizes in a single request."

### Visual: Combined endpoint demo

**[ON SCREEN]**
```python
POST /api/v1/summarization/classify-and-summarize

One request:
1. Upload 779 articles
2. Classify by relevance
3. Auto-summarize relevant ones
4. Export results

Time: ~15 seconds
```

**[NARRATION]**

"This endpoint takes your CSV file, classifies all articles, automatically generates summaries for the relevant ones, and gives you back everything in a structured format. 

From 779 long articles to 54 classified results with summaries in under 15 seconds. That's the power of automation."

---

## [8:00 - 9:00] TECHNICAL HIGHLIGHTS & ARCHITECTURE

### Visual: Technology stack

**[ON SCREEN]**
```
Technology Stack:

Backend:
├─ FastAPI (Python 3.9+)
├─ Async/await for concurrency
└─ 17 REST API endpoints

Machine Learning:
├─ SentenceTransformers (all-MiniLM-L6-v2)
├─ scikit-learn (Logistic Regression)
├─ NLTK (tokenization, NER)
└─ 384-dimensional embeddings

Data Storage:
├─ MySQL 8.0 (relational data)
├─ Filesystem (ML models)
└─ CSV exports (user downloads)

Infrastructure:
├─ Docker + docker-compose
├─ Nginx (reverse proxy)
└─ Production-ready deployment
```

**[NARRATION]**

"Let me quickly highlight some technical decisions:

I chose FastAPI because it's fast, modern, and has automatic API documentation. The async/await support means we can handle multiple scraping requests concurrently.

For machine learning, I used the SentenceTransformer library with the all-MiniLM-L6-v2 model. It's pre-trained on 1.5 billion sentence pairs, which gives us excellent semantic understanding out of the box.

The classifier is a simple Logistic Regression model trained on 384-dimensional embeddings. Sometimes simpler is better—this model is fast, interpretable, and achieved 95% accuracy.

All data is stored in MySQL with a normalized schema, and the entire system is containerized with Docker for easy deployment."

---

## [9:00 - 10:00] RESULTS, IMPACT & FUTURE WORK

### Visual: Results dashboard

**[ON SCREEN]**
```
Project Results:

Performance Metrics:
✓ Classification Accuracy: 95.2%
✓ F1-Score: 0.951
✓ Precision: 0.951
✓ Average processing time: 15 seconds for 779 articles

Business Impact:
✓ 93% reduction in articles to review
✓ Zero manual labeling required
✓ Automated daily monitoring possible
✓ Customizable to any partnership objective

Code Quality:
✓ 17 API endpoints
✓ 9 service classes
✓ 4 routers (modular design)
✓ Comprehensive error handling
✓ Full API documentation
```

**[NARRATION]**

"So what did we achieve?

From a technical standpoint, 95% accuracy without any labeled data is remarkable. The system processes hundreds of articles in seconds and reduces the review workload by over 90%.

From a business standpoint, MSMEs can now monitor partnership opportunities daily without hiring a team of analysts. The system is customizable—just change the partnership objective and it adapts instantly.

From a software engineering standpoint, the code is modular, well-documented, and production-ready. Every endpoint has automatic documentation, error handling, and validation."

### Visual: Future enhancements

**[ON SCREEN]**
```
Future Enhancements:

1. Real-time Monitoring
   - Scheduled daily scraping
   - Email alerts for high-relevance articles

2. Improved Classification
   - Fine-tune on user feedback
   - Multi-label classification

3. Advanced Summarization
   - Abstractive summaries (GPT-based)
   - Multi-document summarization

4. Enhanced Storage
   - Vector database (Pinecone)
   - Similarity search across articles
```

**[NARRATION]**

"There's always room for improvement. Future enhancements could include:

Real-time monitoring with scheduled scraping and email alerts when highly relevant articles appear.

Fine-tuning the classifier based on user feedback to continuously improve accuracy.

Moving from extractive to abstractive summarization using models like GPT for more human-like summaries.

And adding a vector database for semantic search across all historical articles.

But even in its current state, this system delivers real value."

---

## [10:00 - 10:30] CLOSING & CALL TO ACTION

### Visual: Summary slide

**[ON SCREEN]**
```
Summary:

✓ Multi-source web scraping (SerpAPI + LinkedIn)
✓ 95% accurate classification (no labels needed!)
✓ Intelligent extractive summarization
✓ Production-ready FastAPI backend
✓ Complete end-to-end pipeline

Check out the code:
github.com/[your-username]/[repo-name]

Try the API:
[demo-url]:8000/docs

Connect with me:
LinkedIn: [your-profile]
Email: [your-email]
```

**[NARRATION]**

"Let me wrap up. In this video, we've covered:

How to scrape data from multiple sources using APIs.
How to build a 95% accurate classifier without any labeled training data using weak supervision.
How to generate intelligent summaries that preserve key information while reducing length by 93%.
And how to tie it all together in a production-ready FastAPI application.

This project demonstrates full-stack data science skills: API development, web scraping, machine learning, natural language processing, and deployment.

If you want to dive deeper, check out the code on GitHub. You can also try the live demo API—just click the link in the description.

Thanks for watching! If you have questions or want to collaborate on similar projects, feel free to connect with me on LinkedIn or send me an email.

Until next time, happy coding!"

---

## OPTIONAL B-ROLL SUGGESTIONS

**If you have extra time or want to show more detail:**

1. **Code walkthrough** (1-2 min):
   - Show key files: main.py, advanced_classification.py, summarization.py
   - Highlight interesting code patterns

2. **Data exploration** (1-2 min):
   - Open Jupyter notebook
   - Show data distributions, visualizations
   - Demonstrate embedding space

3. **Deployment process** (1-2 min):
   - Show Docker commands
   - Demonstrate docker-compose up
   - Show logs and monitoring

4. **Performance comparison** (1 min):
   - Side-by-side comparison of models
   - Show confusion matrices
   - Demonstrate classification edge cases

---

## PRODUCTION TIPS

### Screen Recording Setup
- **Resolution**: 1920x1080 minimum
- **Frame rate**: 30fps
- **Cursor highlighting**: Enable for easier following
- **Zoom in** on code and terminal output
- **Use VS Code** with a clean theme (Dark+ or similar)

### Audio Recording
- **Microphone**: Use external mic if possible
- **Room**: Record in quiet environment
- **Script**: Practice multiple times, sound natural
- **Pace**: Speak clearly, not too fast
- **Pauses**: Add natural pauses at transitions

### Editing
- **Add captions**: For accessibility and comprehension
- **Highlight key metrics**: Use annotations/arrows
- **Trim dead time**: Cut loading screens to 1-2 seconds
- **Background music**: Soft, non-distracting (optional)
- **Transitions**: Simple cuts or fades between sections

### Engagement
- **Thumbnail**: Show system architecture diagram + "95% Accuracy"
- **Title**: "Building an AI System: Web Scraping to ML Classification (No Labels!)"
- **Description**: Include GitHub link, timestamps, tech stack
- **Tags**: FastAPI, Machine Learning, NLP, Web Scraping, Python

---

## VIDEO CHAPTERS (For YouTube Description)

```
0:00 Introduction & Project Overview
0:45 Problem Statement & System Architecture
2:15 Part 1: Multi-Source Web Scraping
4:00 Part 2: Classification Without Labels (Weak Supervision)
6:15 Part 3: Intelligent Summarization
8:00 Technical Stack & Architecture Decisions
9:00 Results, Impact & Future Enhancements
10:00 Summary & Resources
```

---

## ESTIMATED TIMING BREAKDOWN

| Section | Duration | Type |
|---------|----------|------|
| Introduction | 45 sec | Talking head |
| Problem & Architecture | 90 sec | Slides + narration |
| Scraping Demo | 105 sec | Screen recording + narration |
| Classification Demo | 135 sec | Screen recording + narration |
| Summarization Demo | 105 sec | Screen recording + narration |
| Technical Deep Dive | 60 sec | Slides + narration |
| Results & Future Work | 60 sec | Slides + narration |
| Closing | 30 sec | Talking head |
| **TOTAL** | **10:30** | |

Good luck with your video! 🎬
