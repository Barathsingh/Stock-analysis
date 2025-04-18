from transformers import PegasusForConditionalGeneration, PegasusTokenizer
from transformers import pipeline
from bs4 import BeautifulSoup
import requests
import re
from tradingview_ta import TA_Handler, Exchange, Interval
from sentence_transformers import SentenceTransformer
import faiss
from langchain_community.embeddings import GooglePalmEmbeddings  # Update import
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_community.vectorstores import FAISS  # Update import
from langchain_google_genai import GoogleGenerativeAI


from dotenv import main
import os

main.load_dotenv()

llm = GoogleGenerativeAI(model="models/text-bison-001", google_api_key=os.getenv('google_api_key'))
embeddings = GooglePalmEmbeddings()


text_splitter = RecursiveCharacterTextSplitter(
        separators=['\n\n', '\n','.',','],
        chunk_size = 1000
    )

#defining essential objects
sentiment = pipeline('sentiment-analysis')
model_name = "human-centered-summarization/financial-summarization-pegasus"
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name)


#defining essential data
exclude_list = ['maps', 'policies', 'preferences', 'accounts', 'support']
monitored = ['BPCL', 'BEL']


#function for collecting all urls
def searchUrls(ticker):
    main_url = "https://www.google.com/search?sca_esv=0ccd2abbaed83875&rlz=1C1RXQR_enIN1024IN1024&sxsrf=ADLYWIKOGvq9LIYeMbNo9nP5PG53bWdxiQ:1720963201806&q={}+yahoo+finance&tbm=nws".format(ticker)
    r = requests.get(main_url)
    soup = BeautifulSoup(r.text, 'html.parser')
    atag = soup.findAll('a')
    hrefs = [link['href'] for link in atag]
    return hrefs


#clean collected urls
def clearUrls(urls, exclude_list):
    vals = []
    for url in urls:
        if 'https://' in url and not any(excluded_word in url for excluded_word in exclude_list):
            res = re.findall(r'(https?://\S+)', url)[0].split('&')[0]
            vals.append(res)
    return list(set(vals))   


#scrape the web using cleaned urls for articles
def scrapeCleanedUrls(Urls):
    articles = []
    for url in Urls:
        r = requests.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = [paragraph.text for paragraph in paragraphs]
        words = ' '.join(text).split(' ')[:400]
        ARTICLE = ' '.join(words)
        if ARTICLE !='Thank you for your patience. Our engineers are working quickly to resolve the issue.':
            articles.append(ARTICLE)
        else:
            articles.append("remove")
    return articles


#summarize the collected articles
def summarize(articles):
    summaries = []
    for article in articles:
        if article != 'remove':
            input_ids = tokenizer.encode(article, return_tensors='pt', max_length=400, truncation=True)
            output = model.generate(input_ids, max_length=100, num_beams=5, early_stopping=True)
            summary = tokenizer.decode(output[0], skip_special_tokens=True)
            summaries.append(summary)
        else:
            summaries.append("remove")
    return summaries



#calculate the sentiment of the collected articles
def calculate_sentiment(summaries):
    sentiments = []
    for summary in summaries:
        if summary!="remove":
            sentiments.append(sentiment(summary)[0])
        else:
            sentiments.append('remove')
    return sentiments


#converting the data to jsonformat
def convertJson(monitored):
    result = {}
    print("COLLECTING THE URLs")
    raw_urls = {ticker: searchUrls(ticker) for ticker in monitored}
    print("CLEANING THE URLS")
    clean_urls = {ticker:clearUrls(raw_urls[ticker], exclude_list) for ticker in monitored}
    print("COLLECTING THE ARTICLES")
    articles = {ticker:scrapeCleanedUrls(clean_urls[ticker]) for ticker in monitored}
    print("ANALYSING THE ARTICLES")
    summaries = {ticker:summarize(articles[ticker]) for ticker in monitored}
    print("CALCULATING SENTIMETS")
    scores = {ticker: calculate_sentiment(summaries[ticker]) for ticker in monitored}
    print("PACKING RESULTS")
    for ticker in monitored:
        temp = []
        summary_lst = summaries[ticker]
        for i in range(len(summary_lst)):
            if summary_lst[i]!="remove":
                temp.append({'summary': summaries[ticker][i], "score": scores[ticker][i]['score'], 'label': scores[ticker][i]['label'], 'link': clean_urls[ticker][i]})
        result[ticker] = temp
    return result


def check():
    return "Check route is working"



def get_current_price(symbol):
    stock =  TA_Handler(
        symbol=symbol,
        screener='india',
        exchange='NSE',
        interval=Interval.INTERVAL_1_DAY
    )

    return stock.get_indicators()['close']


def explore(day, month, year):
    url = "https://www.livemint.com/market/latest-markets-today-live-updates-august-6-2024-11722904810843.html"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    live_sec_div = soup.find_all('div', class_='liveSec')
    news = []
    for i in live_sec_div:
        date = i.find('span', class_='timeStamp').text.strip()
        header = i.find('h2', class_='liveTitle').text.strip()
        content = i.find('ul').text.strip()
        link = i.find('a', href=True)['href']
        news.append({
            'date': date,
            'header': header,
            'content': content,
            'link': link
        })
    return news



exclude_list = ['maps', 'policies', 'preferences', 'accounts', 'support']

# Global variables
index = None
articles = []
model2 = SentenceTransformer('all-MiniLM-L6-v2')


# def prepIndex(symbol):
#     global index, articles
#     raw_urls = {ticker: searchUrls(ticker) for ticker in [symbol]}
#     clean_urls = {ticker: clearUrls(raw_urls[ticker], exclude_list) for ticker in [symbol]}
#     articles_dict = {ticker: scrapeCleanedUrls(clean_urls[ticker]) for ticker in [symbol]}
#     articles = [article for article in articles_dict[symbol] if article != "remove"]
#     embeddings = model2.encode(articles)
#     dimension = embeddings.shape[1]
#     index = faiss.IndexFlatL2(dimension)
#     index.add(embeddings)

def retrieve_chunks(query, k=3):
    query_embedding = model2.encode([query])
    distances, indices = index.search(query_embedding, k)
    return [articles[i] for i in indices[0]]

def generate_response(chunks, query):
    pipe = pipeline("question-answering", model="deepset/roberta-base-squad2", tokenizer="deepset/roberta-base-squad2")
    context = " ".join(chunks)
    answer = pipe(question=query, context=context)
    return answer

def answerQuestion(query):
    relevant_chunks = retrieve_chunks(query)
    response = generate_response(relevant_chunks, query)
    return response


def load_index(symbol):
    raw_urls = {ticker: searchUrls(ticker) for ticker in [symbol]}
    clean_urls = {ticker: clearUrls(raw_urls[ticker], exclude_list) for ticker in [symbol]}
    articles_dict = {ticker: scrapeCleanedUrls(clean_urls[ticker]) for ticker in [symbol]}
    articles = [article for article in articles_dict[symbol] if article != "remove"]
    data1 = ' '.join(articles) 
    docs = text_splitter.create_documents([data1])
    print(docs)
    vectorstore_genai = FAISS.from_documents(docs, embeddings) 
    vectorstore_genai.save_local('faiss_index')
    

def ask(query):
    new_faiss_index = FAISS.load_local('faiss_index', embeddings, allow_dangerous_deserialization=True)
    qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=new_faiss_index.as_retriever(search_kwargs={"k": 10}),
    )
    result = qa.invoke(query)
    # print(result['result'])
    return result['result']
