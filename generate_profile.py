#!/usr/bin/env python3
"""
Simple CLI tool to generate company profiles.

Usage:
    python generate_profile.py

Or make it executable:
    chmod +x generate_profile.py
    ./generate_profile.py
"""

import requests
import sys
import json

BASE_URL = "http://localhost:8000"

def print_header():
    """Print nice header."""
    print("\n" + "=" * 80)
    print("🏢 COMPANY PROFILE GENERATOR")
    print("=" * 80)
    print()

def get_company_input():
    """Get company information from user."""
    print("Enter company details:")
    print("-" * 80)
    
    company_name = input("  📍 Company name: ").strip()
    if not company_name:
        print("\n❌ Error: Company name is required!")
        return None
    
    location = input("  🌍 Location: ").strip()
    if not location:
        print("\n❌ Error: Location is required!")
        return None
    
    max_articles_input = input("  📰 Max articles (default 15): ").strip()
    if max_articles_input:
        try:
            max_articles = int(max_articles_input)
        except ValueError:
            print("  ⚠️  Invalid number, using default 15")
            max_articles = 15
    else:
        max_articles = 15
    
    return {
        'company_name': company_name,
        'location': location,
        'max_articles': max_articles
    }

def generate_profile(data):
    """Call the API to generate profile."""
    print()
    print("-" * 80)
    print(f"🔍 Generating profile for: {data['company_name']} ({data['location']})")
    print(f"📊 Analyzing up to {data['max_articles']} articles...")
    print()
    print("⏳ Please wait (this may take 10-20 seconds)...")
    print("-" * 80)
    
    try:
        url = f"{BASE_URL}/api/v1/profile/generate"
        response = requests.post(url, data=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            profile = result['data']
            
            # Print the profile
            print("\n" + "=" * 80)
            print("✅ PROFILE GENERATED SUCCESSFULLY!")
            print("=" * 80)
            print()
            
            # Company name
            print(f"# {profile['company_name']}")
            print()
            
            # Description
            print("## 📋 Description")
            print(profile['description'])
            print()
            
            # Metadata
            metadata = profile['metadata']
            print(f"(Based on {metadata['articles_analyzed']} articles)")
            print()
            
            # Strengths
            if profile['strengths']:
                print("## 💪 Strengths")
                print()
                for i, strength in enumerate(profile['strengths'], 1):
                    print(f"  {i}. {strength}")
                print()
            
            # Weaknesses
            if profile['weaknesses']:
                print("## ⚠️  Weaknesses")
                print()
                for i, weakness in enumerate(profile['weaknesses'], 1):
                    print(f"  {i}. {weakness}")
                print()
            
            print("=" * 80)
            
            # Ask if user wants to save
            save = input("\n💾 Save to file? (y/n, default n): ").strip().lower()
            if save == 'y':
                filename = f"{profile['company_name'].replace(' ', '_').lower()}_profile.json"
                with open(filename, 'w') as f:
                    json.dump(profile, f, indent=2)
                print(f"✅ Saved to: {filename}")
            
            return True
            
        elif response.status_code == 404:
            error = response.json()
            print("\n❌ No articles found!")
            print(f"\n{error.get('detail', 'Unknown error')}")
            print("\nTips:")
            print("  • Check the company name spelling")
            print("  • Make sure the company has recent news coverage")
            print("  • Try a more well-known company name")
            return False
            
        elif response.status_code == 500:
            try:
                error = response.json()
                detail = error.get('detail', 'Unknown error')
                print(f"\n❌ Server Error: {detail}")
                
                if "SERPAPI" in detail or "API key" in detail:
                    print("\n⚠️  SerpAPI Configuration Issue:")
                    print("  1. Get a free API key: https://serpapi.com/")
                    print("  2. Set it in your environment:")
                    print("     export SERPAPI_API_KEY='your_key_here'")
                    print("  3. Restart the server")
            except:
                print(f"\n❌ Server Error: {response.text}")
            return False
        else:
            print(f"\n❌ Error: HTTP {response.status_code}")
            try:
                error = response.json()
                print(f"Details: {error.get('detail', response.text)}")
            except:
                print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to server!")
        print("\n🔧 Troubleshooting:")
        print("  1. Start the server:")
        print("     python app/main.py")
        print()
        print("  2. Check if it's running:")
        print("     curl http://localhost:8000/health")
        print()
        print("  3. Server should be at:", BASE_URL)
        return False
        
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out!")
        print("The server might be busy or the company has too many articles.")
        print("Try again with fewer articles (e.g., max_articles=10)")
        return False
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        print("\nDetails:")
        traceback.print_exc()
        return False

def main():
    """Main function."""
    print_header()
    
    # Check if server is running first
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            print("✅ Server is running")
            print()
    except:
        print("⚠️  Warning: Cannot connect to server")
        print("   Make sure to run: python app/main.py")
        print()
        cont = input("Continue anyway? (y/n): ").strip().lower()
        if cont != 'y':
            print("\nExiting...")
            sys.exit(0)
        print()
    
    # Main loop
    while True:
        # Get company input
        data = get_company_input()
        if not data:
            break
        
        # Generate profile
        success = generate_profile(data)
        
        # Ask if user wants to continue
        print()
        another = input("🔄 Generate another profile? (y/n, default n): ").strip().lower()
        if another != 'y':
            break
        
        print("\n" + "=" * 80 + "\n")
    
    print("\n👋 Thanks for using Company Profile Generator!")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user. Exiting...")
        sys.exit(0)

