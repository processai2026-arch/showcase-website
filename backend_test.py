#!/usr/bin/env python3
"""
Backend API Testing for Process AI
Tests all endpoints including auth, bookings, services, projects
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class ProcessAITester:
    def __init__(self, base_url="https://4b531a68-a1b6-4d5f-b8fd-e8f830b480b5.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and data.get("status") == "healthy":
                self.log_test("Health Check", True)
                return True
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}, Data: {data}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_admin_login(self):
        """Test admin login with correct credentials"""
        try:
            login_data = {
                "email": "admin@processai.com",
                "password": "ProcessAI@Admin2024"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "admin":
                    # Check if cookies are set
                    cookies = response.cookies
                    has_access_token = 'access_token' in cookies
                    has_refresh_token = 'refresh_token' in cookies
                    
                    if has_access_token and has_refresh_token:
                        self.log_test("Admin Login", True)
                        return True
                    else:
                        self.log_test("Admin Login", False, "Missing auth cookies")
                        return False
                else:
                    self.log_test("Admin Login", False, f"Wrong role: {data.get('role')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_auth_me_endpoint(self):
        """Test getting current user info"""
        try:
            response = self.session.get(f"{self.base_url}/api/auth/me", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("email") == "admin@processai.com" and data.get("role") == "admin":
                    self.log_test("Auth Me Endpoint", True)
                    return True
                else:
                    self.log_test("Auth Me Endpoint", False, f"Wrong user data: {data}")
                    return False
            else:
                self.log_test("Auth Me Endpoint", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth Me Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_services_endpoint(self):
        """Test services endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/services", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Should return a list (even if empty)
                if isinstance(data, list):
                    self.log_test("Services Endpoint", True)
                    return True
                else:
                    self.log_test("Services Endpoint", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Services Endpoint", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Services Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_projects_endpoint(self):
        """Test projects endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/projects", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Should return a list (even if empty)
                if isinstance(data, list):
                    self.log_test("Projects Endpoint", True)
                    return True
                else:
                    self.log_test("Projects Endpoint", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Projects Endpoint", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Projects Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_booking_submission(self):
        """Test booking form submission"""
        try:
            booking_data = {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1234567890",
                "company": "Test Company",
                "service_type": "AI Automation",
                "budget": "$15,000 - $50,000",
                "message": "This is a test booking submission",
                "preferred_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }
            
            response = self.session.post(
                f"{self.base_url}/api/bookings",
                json=booking_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "message" in data:
                    self.log_test("Booking Submission", True)
                    return True
                else:
                    self.log_test("Booking Submission", False, f"Missing id or message in response: {data}")
                    return False
            else:
                self.log_test("Booking Submission", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Booking Submission", False, f"Exception: {str(e)}")
            return False

    def test_admin_bookings_access(self):
        """Test admin access to bookings"""
        try:
            response = self.session.get(f"{self.base_url}/api/bookings", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Admin Bookings Access", True)
                    return True
                else:
                    self.log_test("Admin Bookings Access", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Admin Bookings Access", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Bookings Access", False, f"Exception: {str(e)}")
            return False

    def test_logout(self):
        """Test logout functionality"""
        try:
            response = self.session.post(f"{self.base_url}/api/auth/logout", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Logout", True)
                    return True
                else:
                    self.log_test("Logout", False, f"Missing message in response: {data}")
                    return False
            else:
                self.log_test("Logout", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Logout", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Process AI Backend Tests")
        print("=" * 50)
        
        # Test basic endpoints first
        if not self.test_health_endpoint():
            print("❌ Health check failed - stopping tests")
            return False
            
        # Test public endpoints
        self.test_services_endpoint()
        self.test_projects_endpoint()
        
        # Test booking submission (public)
        self.test_booking_submission()
        
        # Test admin authentication
        if self.test_admin_login():
            # Test authenticated endpoints
            self.test_auth_me_endpoint()
            self.test_admin_bookings_access()
            self.test_logout()
        else:
            print("❌ Admin login failed - skipping authenticated tests")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    """Main test runner"""
    tester = ProcessAITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/test_reports/backend_test_results.json", "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())