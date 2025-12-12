CREATE TABLE "STUDENT"(
    "USN" VARCHAR(255) NOT NULL,
    "First_Name" VARCHAR(255) NOT NULL,
    "Last_Name" VARCHAR(255) NOT NULL,
    "Date_born" DATE NOT NULL,
    "Sex" VARCHAR(255) NOT NULL,
    "Phone_No" VARCHAR(255) NOT NULL,
    "Father_Name" VARCHAR(255) NOT NULL,
    "Mother_Name" VARCHAR(255) NOT NULL,
    "SSLC" FLOAT(53) NOT NULL,
    "PUC" FLOAT(53) NOT NULL,
    "Number_Of_Internships" INT NOT NULL,
    "No_of_Hackathons" INT NOT NULL,
    "No_of_Projects" INT NOT NULL
);
ALTER TABLE
    "STUDENT" ADD PRIMARY KEY("USN");
CREATE TABLE "ACADEMIC_DETAILS"(
    "AD_USSN" VARCHAR(255) NOT NULL,
    "Course_Code" VARCHAR(255) NOT NULL,
    "Course_Name" VARCHAR(255) NOT NULL,
    "Semester" BIGINT NOT NULL,
    "Grade" VARCHAR(255) NOT NULL,
    "Credits_earned" BIGINT NOT NULL,
    "Year" BIGINT NOT NULL
);
CREATE TABLE "Skills"(
    "S_USN" VARCHAR(255) NOT NULL,
    "Skill_Name" VARCHAR(255) NOT NULL,
    "Rating" FLOAT(53) NOT NULL
);
CREATE TABLE "Group_Entries"(
    "Group_ID" VARCHAR(255) NOT NULL,
    "Admin_ID" VARCHAR(255) NOT NULL,
    "S_USN" VARCHAR(255) NOT NULL
);
CREATE TABLE "Admin_Details"(
    "Admin_ID" VARCHAR(255) NOT NULL,
    "Admin_Name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Admin_Details" ADD PRIMARY KEY("Admin_ID");
CREATE TABLE "Group_Details"(
    "Group_ID" VARCHAR(255) NOT NULL,
    "Group_Name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Group_Details" ADD PRIMARY KEY("Group_ID");
ALTER TABLE
    "Group_Entries" ADD CONSTRAINT "group_entries_group_id_foreign" FOREIGN KEY("Group_ID") REFERENCES "Group_Details"("Group_ID");
ALTER TABLE
    "Group_Entries" ADD CONSTRAINT "group_entries_admin_id_foreign" FOREIGN KEY("Admin_ID") REFERENCES "Admin_Details"("Admin_ID");
ALTER TABLE
    "ACADEMIC_DETAILS" ADD CONSTRAINT "academic_details_ad_ussn_foreign" FOREIGN KEY("AD_USSN") REFERENCES "STUDENT"("USN");
ALTER TABLE
    "Skills" ADD CONSTRAINT "skills_s_usn_foreign" FOREIGN KEY("S_USN") REFERENCES "STUDENT"("USN");
ALTER TABLE
    "Group_Entries" ADD CONSTRAINT "group_entries_s_usn_foreign" FOREIGN KEY("S_USN") REFERENCES "STUDENT"("USN");      