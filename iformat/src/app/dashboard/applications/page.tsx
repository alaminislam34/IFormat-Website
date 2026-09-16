import { Metadata } from "next";
import { CandidateApplicationsView } from "@/features/applicants/components/candidate-applications-view";

export const metadata: Metadata = {
  title: "My Job Applications | iFormat",
  description: "Track your submitted job applications, employer reviews, and AI screening match results in real-time.",
};

export default function ApplicationsPage() {
  return <CandidateApplicationsView />;
}
