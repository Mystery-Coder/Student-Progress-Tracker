from supabase import create_client
import os

class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.client = create_client(url, key) #supabase init()
    
    def get_student_basic_info(self, usn: str):
        response = self.client.table("STUDENT") \
            .select("*") \
            .eq("USN", usn) \
            .execute()
        
        return response.data[0] if response.data else None
    
    def get_academic_records(self, usn: str):
        response = self.client.table("ACADEMIC_DETAILS") \
            .select("Grade, Credits_earned") \
            .eq("AD_USN", usn) \
            .execute()
        
        return response.data
    
    def get_skills(self, usn: str):
        response = self.client.table("Skills") \
            .select("Skill_Name, Rating") \
            .eq("S_USN", usn) \
            .execute()
        
        return response.data
    
    def calculate_cgpa(self, usn: str):
        records = self.get_academic_records(usn)
        
        if not records:
            return 0.0
        
        grade_map = {
        'O': 10.0, 'A+': 9.0, 'A': 8.0, 
        'B+': 7.0, 'B': 6,
        'C': 5.0, 
        'P': 4.0 , 'F':0.0
        }
        
        total_grade_points = 0
        total_credits = 0
        
        for record in records:
            grade = record.get('Grade', '').strip().upper()
            credits = record.get('Credits_earned', 0)
            
            # Skip F grades
            if grade == 'F':
                continue
            
            grade_point = grade_map.get(grade, 0)
            total_grade_points += grade_point * credits
            total_credits += credits
        
        return round(total_grade_points / total_credits, 2) if total_credits > 0 else 0.0
    
    def get_average_skills_rating(self, usn: str):
        skills = self.get_skills(usn)
        
        if not skills:
            return 0.0
        
        ratings = [float(skill.get('Rating') or 0) for skill in skills]
        return round(sum(ratings) / len(ratings), 2) if ratings else 0.0
    
    def get_complete_student_profile(self, usn: str):
        student = self.get_student_basic_info(usn)
        if not student:
            return None
        
        cgpa = self.calculate_cgpa(usn)
        skills_rating = self.get_average_skills_rating(usn)
        
        return {
            'usn': usn,
            'name': f"{student.get('First_Name', '')} {student.get('Last_Name', '')}".strip(),
            'cgpa': cgpa,
            'internships': student.get('Number_Of_Internships') or 0,
            'projects': student.get('No_of_Projects') or 0,
            'hackathons': student.get('No_of_Hackathons') or 0,
            'skills_rating': skills_rating,
            'ssc_marks': student.get('SSLC') or 0.0,
            'hsc_marks': student.get('PUC') or 0.0
        }