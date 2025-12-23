// ignore_for_file: non_constant_identifier_names

class StudentDetails {
  String USN;
  double SSLC;
  double PUC;
  int noOfProjects;
  int noOfHackathons;
  int noOfInternships;

  StudentDetails({
    required this.USN,
    required this.PUC,
    required this.SSLC,
    required this.noOfHackathons,
    required this.noOfInternships,
    required this.noOfProjects,
  });
}
