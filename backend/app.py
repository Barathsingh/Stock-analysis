from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from pymongo.errors import ConnectionFailure
import utils
from sentence_transformers import SentenceTransformer
import faiss
from transformers import pipeline

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

try:
    client = pymongo.MongoClient("mongodb://localhost:27017")
    client.admin.command('ping')
    db = client.stocksageai
    users_collection = db.users
    print("Connected to MongoDB")
except ConnectionFailure as e:
    print(f"Could not connect to MongoDB: {e}")

@app.route('/')
def home():
    return "Hello Flask"

@app.route('/check')
def check():
    status = "Check route is working"
    return status

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users_collection.find_one({"username": username})
    if user and user["password"] == password:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        repeat_password = data.get("repeatPassword")

        if not username or not password or not repeat_password:
            return jsonify({"error": "Username, password, and repeat password are required"}), 400

        if password != repeat_password:
            return jsonify({"error": "Passwords do not match"}), 400

        # Check if the user already exists
        if users_collection.find_one({"username": username}):
            return jsonify({"error": "User already exists"}), 409

        # Add new user
        result = users_collection.insert_one({
            "username": username, 
            "password": password,
            "watchlist": [],
            "portfolio": []
        })
        print(f"User {username} added with ID: {result.inserted_id}")
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@app.route('/get_portfolio', methods=['POST'])
def get_portfolio():
    data = request.json
    username = data['username']
    
    user = users_collection.find_one({"username": username})
    if user:
        return jsonify({"portfolio": user.get("portfolio", [])}), 200
    else:
        return jsonify({"error": "User not found"}), 404
    
    

@app.route('/add_to_portfolio', methods=['POST'])
def add_to_portfolio():
    try:
        data = request.get_json()
        print(data)
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        username = data.get('username')
        symbol = data.get('symbol')
        buyPrice = data.get('buyPrice')
        print(username)

        if not username or not symbol or buyPrice is None:
            return jsonify({"error": "Username, symbol, and buyPrice are required"}), 400

        item = {
            "symbol": symbol,
            "buyPrice": buyPrice
        }

        result = users_collection.update_one(
            {'username': username},
            {'$addToSet': {'portfolio': item}},
            upsert=True
        )

        if result.matched_count == 0 and result.upserted_id is None:
            return jsonify({"error": "Failed to add item to portfolio"}), 500

        return jsonify({'message': 'Item added to portfolio'}), 200
    except Exception as e:
        app.logger.error(f"Error in add_to_portfolio: {str(e)}")
        return jsonify({'error': 'An internal error occurred'}), 500






@app.route('/remove_from_portfolio', methods=['POST'])
def remove_from_portfolio():
    data = request.json
    username = data['username']
    symbol = data['symbol']

    users_collection.update_one(
        {'username': username},
        {'$pull': {'portfolio': {'symbol': symbol}}}
    )

    return jsonify({'message': 'Item removed from portfolio'}), 200

@app.route('/remove_from_watchlist', methods=['POST'])
def remove_from_watchlist():
    data = request.json
    username = data['username']
    item = data['item']

    users_collection.update_one(
        {'username': username},
        {'$pull': {'watchlist': item}}
    )

    return jsonify({'message': 'Item removed from watchlist'}), 200

@app.route('/get_watchlist', methods=['POST'])
def get_watchlist():
    data = request.json
    username = data['username']
    
    user = users_collection.find_one({"username": username})
    if user:
        return jsonify({"watchlist": user.get("watchlist", [])}), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/add_to_watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.get_json()
    username = data['username']
    item = data['item']
    print(item)

    users_collection.update_one(
        {'username': username},
        {'$addToSet': {'watchlist': item}},
        upsert=True
    )

    return jsonify({'message': 'Item added to watchlist'}), 200

@app.route('/get_ai_analysis', methods=['POST'])
def get_ai_analysis():
    data = request.json
    symbol = data['symbol']
    analysis = utils.convertJson([symbol])
    print(symbol)
    print(analysis)
    return jsonify(analysis), 200

@app.route('/get_current_price/<symbol>', methods=['GET'])
def get_current_price(symbol):
    price = utils.get_current_price(symbol)
    print(symbol)
    print(price)
    return jsonify({'price': price})


@app.route('/explore_news', methods=['POST'])
def explore_news():
    date = request.json
    content = utils.explore(date['day'], date['month'], date['year'])
    return jsonify(content), 200





# # Initialize the model and load it once
# model = SentenceTransformer('all-MiniLM-L6-v2')
# qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2", tokenizer="deepset/roberta-base-squad2")

# index = None
# articles = []

# def load_index(articles_list):
#     global index, articles
#     articles = [article for article in articles_list if article != "remove"]
#     embeddings = model.encode(articles)
#     dimension = embeddings.shape[1]
#     index = faiss.IndexFlatL2(dimension)
#     index.add(embeddings)

# def retrieve_chunks(query, k=3):
#     query_embedding = model.encode([query])
#     distances, indices = index.search(query_embedding, k)
#     return [articles[i] for i in indices[0]]

# def generate_response(chunks, query):
#     context = " ".join(chunks)
#     answer = qa_pipeline(question=query, context=context)
#     return answer

@app.route('/load_index', methods=['POST'])
def load_articles():
    data = request.json
    utils.load_index(data)
    return jsonify({"message": "Articles loaded successfully"}), 200

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    query = data['query']
    response = utils.ask(query)
    # print(response)
    return jsonify(response)



 

if __name__ == '__main__':
    app.run(debug=True)
