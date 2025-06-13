export interface SkillItem {
  name: string;
  detail?: string | null;
  proficiency_level?: string | null; // Beginner / Intermediate / Advanced / Expert
  years_of_experience?: number | null; // số năm kinh nghiệm, có thể null
  certified?: boolean | null; // có chứng chỉ không, có thể null
}
