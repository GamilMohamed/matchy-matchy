import { Button } from "pixel-retroui";

export default function NavigateTabs({ label, goToNextTab, goToPreviousTab }: { label: string; goToNextTab: () => void; goToPreviousTab: () => void }) {
  return (
    <div className="flex justify-between mt-6 pt-4 bg-green-500">
		{label !== "basic-info" && (
			<Button type="button" onClick={goToPreviousTab}>
        Previous
      </Button>
		)}
      <Button type="submit" onClick={goToNextTab}>
        Next
      </Button>
    </div>
  );
}
