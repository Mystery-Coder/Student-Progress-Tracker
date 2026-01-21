def generate_recommendation(features: dict, placement_score: float):
    if placement_score >= 80:
        return "Excellent! You're placement-ready. Focus on interview preparation and company research."
    if placement_score >= 60:
        return "Good profile! Polish your interview skills and work on any weak areas below."
    
    suggestions = []
    if features['CGPA'] < 7.5:
        suggestions.append("Improve CGPA to at least 7.5 (current: {:.2f})".format(features['CGPA']))
    
    if features['Internships'] < 1:
        suggestions.append("Complete at least 1 quality internships (current: {})".format(features['Internships']))
    
    if features['Projects'] < 3:
        suggestions.append("Build 3+ substantial projects (current: {})".format(features['Projects']))
    
    if features['Skill Rating'] < 3.5:
        suggestions.append("Improve technical and soft skills (current rating: {:.1f}/5)".format(features['Skill Rating']))
    
    if features['ExtracurricularActivities'] == 0:
        suggestions.append("Participate in hackathons, competitions, or coding contests")
    
    if features['SSC_Marks'] < 75 or features['HSC_Marks'] < 75:
        suggestions.append("Note: Academic foundation (SSC/HSC) impacts overall profile")
    
    # Return formatted suggestions
    if not suggestions:
        return "Keep working on overall profile improvement and interview preparation."
    
    return "Focus Areas:\n" + "\n".join(f"  • {s}" for s in suggestions[:4])


def get_strength_analysis(features: dict):
    strengths = []
    
    if features['CGPA'] >= 8.5:
        strengths.append("Strong CGPA")
    
    if features['Internships'] >= 2:
        strengths.append("Good internship experience")
    
    if features['Projects'] >= 3:
        strengths.append("Solid project portfolio")
    
    if features['Skill Rating'] >= 4.0:
        strengths.append("Excellent skills")
    
    if features['ExtracurricularActivities'] == 1:
        strengths.append("Active in extracurriculars")
    
    return strengths