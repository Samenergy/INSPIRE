"""Test the Comprehensive Analysis endpoint (7 Questions)."""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_comprehensive_analysis():
    """Test the 7-question comprehensive analysis."""
    
    print("=" * 80)
    print("COMPREHENSIVE COMPANY ANALYSIS TEST (LLM-Powered)")
    print("Answers 7 Questions with Adaptive Industry-Specific Prompts")
    print("=" * 80)
    print()
    
    # Get user input
    print("Enter analysis details:")
    print()
    
    company_name = input("  📍 Target Company name: ").strip()
    if not company_name:
        print("❌ Company name required!")
        return 
    
    csv_file = input("  📄 CSV file path (default: test_mtn_comprehensive.csv): ").strip()
    if not csv_file:
        csv_file = "test_mtn_comprehensive.csv"
    
    print()
    print("  🎯 YOUR SME Objective (what YOUR company offers):")
    print("     Example: 'We provide mobile payment solutions for SMEs in Africa'")
    sme_objective = input("     → ").strip()
    
    if not sme_objective:
        print("  Using default...")
        sme_objective = "We provide digital payment solutions, merchant management platforms, and business analytics tools for small and medium enterprises in Africa."
    
    print()
    print(f"Analyzing {company_name} from {csv_file}...")
    print("This will answer 7 business intelligence questions:")
    print("  1. Latest Updates")
    print("  2. Challenges")
    print("  3. Decision Makers")
    print("  4. Market Position")
    print("  5. Future Plans")
    print("  6. Action Plan (AI-generated, industry-adapted)")
    print("  7. Solutions (AI-generated, industry-adapted)")
    print()
    print("⏳ Please wait (LLM is thinking... this may take 1-2 minutes)...")
    print("-" * 80)
    
    try:
        # Call the API
        url = f"{BASE_URL}/api/v1/analysis/analyze"
        
        with open(csv_file, 'rb') as f:
            files = {'file': (csv_file, f, 'text/csv')}
            data = {
                'company_name': company_name,
                'sme_objective': sme_objective,
                'llm_provider': 'auto'
            }
            
            response = requests.post(url, files=files, data=data, timeout=180)  # 3 minutes for LLM
        
        if response.status_code == 200:
            result = response.json()
            analysis = result['data']['analysis']
            
            print("\n✅ ANALYSIS COMPLETED!")
            print("=" * 80)
            
            # Print all answers
            questions = [
                ('1_latest_updates', '1. LATEST UPDATES'),
                ('2_challenges', '2. CHALLENGES'),
                ('3_decision_makers', '3. DECISION MAKERS'),
                ('4_market_position', '4. MARKET POSITION'),
                ('5_future_plans', '5. FUTURE PLANS'),
                ('6_action_plan', '6. ACTION PLAN'),
                ('7_solutions', '7. SOLUTIONS')
            ]
            
            for key, title in questions:
                print(f"\n{title}")
                print("-" * 80)
                answer = analysis.get(key, 'No answer')
                print(answer)
                print()
            
            print("=" * 80)
            
            # Print metadata
            metadata = result['data']['metadata']
            print(f"\n📊 Metadata:")
            print(f"   Articles analyzed: {metadata['articles_analyzed']}")
            print(f"   Method: {metadata.get('method', 'N/A')}")
            print(f"   LLM Provider: {metadata.get('llm_provider', 'N/A')}")
            print(f"   SME Industry Detected: {metadata.get('sme_industry_detected', 'N/A')}")
            print(f"   Target Industry Detected: {metadata.get('target_industry_detected', 'N/A')}")
            
            # Save to file
            save = input("\n💾 Save full JSON to file? (y/n): ").strip().lower()
            if save == 'y':
                filename = f"{company_name.replace(' ', '_').lower()}_comprehensive_analysis.json"
                with open(filename, 'w') as f:
                    json.dump(result['data'], f, indent=2)
                print(f"✅ Saved to: {filename}")
        
        else:
            print(f"\n❌ FAILED: HTTP {response.status_code}")
            try:
                error = response.json()
                print(f"Error: {error.get('detail', response.text)}")
            except:
                print(f"Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to server!")
        print("Make sure server is running: python -m app.main")
    except FileNotFoundError:
        print(f"\n❌ File not found: {csv_file}")
        print("Make sure the CSV file exists")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


def test_service_info():
    """Test the service info endpoint."""
    print("\n" + "=" * 80)
    print("TESTING: Service Information")
    print("=" * 80)
    
    try:
        url = f"{BASE_URL}/api/v1/analysis/info"
        response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            info = result['data']
            
            print(f"\n✅ {info['service_name']} v{info['version']}")
            print(f"\n{info['description']}")
            
            print(f"\n📋 Questions Answered:")
            for key, desc in info['questions'].items():
                print(f"   {key}. {desc}")
            
            print(f"\n🤖 Technology:")
            tech = info.get('technology', {})
            print(f"   Method: {tech.get('method', 'N/A')}")
            print(f"   All Questions: {tech.get('all_questions', 'N/A')}")
            print(f"   Providers: {', '.join(tech.get('providers', []))}")
            print(f"   Works with: {tech.get('works_with', 'N/A')}")
            
            print(f"\n✅ YOUR Contributions:")
            for contrib in info['your_contributions']:
                print(f"   • {contrib}")
        else:
            print(f"❌ Failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("COMPREHENSIVE ANALYSIS - TEST SCRIPT")
    print("=" * 80)
    print("\nMake sure:")
    print("  1. Server is running: python -m app.main")
    print("  2. transformers installed: pip install transformers torch")
    print("  3. (Optional) Ollama running for LLM synthesis")
    print("=" * 80)
    print()
    
    # Menu
    print("Options:")
    print("  1. Test service info")
    print("  2. Run comprehensive analysis")
    print("  3. Both")
    print()
    choice = input("Select (1/2/3, default 2): ").strip()
    
    if choice == "1":
        test_service_info()
    elif choice == "3":
        test_service_info()
        print("\n")
        test_comprehensive_analysis()
    else:
        test_comprehensive_analysis()
    
    print("\n" + "=" * 80)
    print("✅ TEST COMPLETED")
    print("=" * 80)

