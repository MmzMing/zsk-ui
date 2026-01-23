import React from "react";
import UndevelopedPage from "@/components/Undeveloped";

function CrazinessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UndevelopedPage 
        title="AI区" 
        description="这里是用来自定义AI Agent，目前正在规划中，敬请期待！" 
      />
    </div>
  );
}

export default CrazinessPage;
