-- STUDENT table (no dependencies)
CREATE TABLE public.STUDENT (
  USN VARCHAR(255) NOT NULL DEFAULT '0',
  First_Name VARCHAR(255) NOT NULL DEFAULT 'X',
  Last_Name VARCHAR(255) NOT NULL DEFAULT 'Y',
  Date_born DATE,
  Sex VARCHAR(10),
  Phone_No VARCHAR(20),
  Father_Name VARCHAR(255),
  Mother_Name VARCHAR(255),
  SSLC DOUBLE PRECISION NOT NULL DEFAULT 0,
  PUC DOUBLE PRECISION NOT NULL DEFAULT 0,
  Number_Of_Internships INTEGER NOT NULL DEFAULT 0,
  No_of_Hackathons INTEGER NOT NULL DEFAULT 0,
  No_of_Projects INTEGER NOT NULL DEFAULT 0,
  user_id UUID,
  CONSTRAINT STUDENT_pkey PRIMARY KEY (USN)
);

-- Admin_Details table (no dependencies)
CREATE TABLE public.Admin_Details (
  Admin_ID VARCHAR(255) NOT NULL DEFAULT 'X',
  Admin_Name VARCHAR(255) NOT NULL,
  user_id UUID UNIQUE,
  Phone_Number VARCHAR(20),
  Designation TEXT,
  CONSTRAINT Admin_Details_pkey PRIMARY KEY (Admin_ID)
);

-- COURSE table (no dependencies)
CREATE TABLE public.COURSE (
  Course_Code TEXT NOT NULL,
  Course_Name TEXT NOT NULL,
  Credits INTEGER NOT NULL,
  Year SMALLINT,
  CONSTRAINT COURSE_pkey PRIMARY KEY (Course_Code),
  CONSTRAINT COURSE_Year_check CHECK (Year >= 1 AND Year <= 4)
);

-- Group_Details table (no dependencies)
CREATE TABLE public.Group_Details (
  Group_ID VARCHAR(255) NOT NULL,
  Group_Name VARCHAR(255) NOT NULL,
  Current_Year INTEGER,
  CONSTRAINT Group_Details_pkey PRIMARY KEY (Group_ID),
  CONSTRAINT Group_Details_Current_Year_check CHECK (Current_Year >= 1 AND Current_Year <= 4)
);

-- ACADEMIC_DETAILS table (depends on STUDENT)
CREATE TABLE public.ACADEMIC_DETAILS (
  AD_USN VARCHAR(255) NOT NULL,
  Course_Code VARCHAR(255) NOT NULL,
  Course_Name VARCHAR(255) NOT NULL,
  Semester BIGINT NOT NULL,
  Grade VARCHAR(10) NOT NULL,
  Credits_earned BIGINT NOT NULL,
  Year BIGINT NOT NULL,
  Sl_No SERIAL NOT NULL,
  CONSTRAINT ACADEMIC_DETAILS_pkey PRIMARY KEY (Sl_No),
  CONSTRAINT ACADEMIC_DETAILS_AD_USN_fkey FOREIGN KEY (AD_USN) REFERENCES public.STUDENT(USN)
);

-- Skills table (depends on STUDENT)
CREATE TABLE public.Skills (
  S_USN VARCHAR(255) NOT NULL,
  Skill_Name VARCHAR(255) NOT NULL,
  Rating DOUBLE PRECISION NOT NULL,
  Sl_No SERIAL NOT NULL,
  CONSTRAINT Skills_pkey PRIMARY KEY (Sl_No),
  CONSTRAINT Skills_S_USN_fkey FOREIGN KEY (S_USN) REFERENCES public.STUDENT(USN)
);

-- Group_Entries table (depends on Group_Details, Admin_Details, and STUDENT)
CREATE TABLE public.Group_Entries (
  Group_ID VARCHAR(255) NOT NULL,
  Admin_ID VARCHAR(255) NOT NULL,
  S_USN VARCHAR(255) NOT NULL,
  Sl_No SERIAL NOT NULL,
  CONSTRAINT Group_Entries_pkey PRIMARY KEY (Sl_No),
  CONSTRAINT Group_Entries_Group_ID_fkey FOREIGN KEY (Group_ID) REFERENCES public.Group_Details(Group_ID),
  CONSTRAINT Group_Entries_S_USN_fkey FOREIGN KEY (S_USN) REFERENCES public.STUDENT(USN),
  CONSTRAINT Group_Entries_Admin_ID_fkey FOREIGN KEY (Admin_ID) REFERENCES public.Admin_Details(Admin_ID)
);