import { notFound } from "next/navigation";
import Image from 'next/image';
import { prisma } from "../../prisma/prisma";

type Member = {
  id: string;
  role: string;
  // add other member fields if needed
};

type Campaign = {
  name: string;
  description: string;
  avatar?: string;
  members: Member[];
  // add other campaign fields if needed
};

export default async function CampaignDashboard({ params }: { params: { "campaign-slug": string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: params["campaign-slug"] },
    include: { members: true },
  }) as Campaign | null;

  if (!campaign) return notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6eaf3]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">{campaign.name}</h1>
        <p className="mb-4 text-center text-gray-600">{campaign.description}</p>
        {campaign.avatar && (
          <div className="flex justify-center mb-6">
              <Image src={campaign.avatar} alt="avatar" width={96} height={96} className="w-24 h-24 rounded-full" />
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Members</h2>
        <ul className="mb-6">
          {campaign.members.map(m => (
            <li key={m.id} className="mb-2">
              {m.role === "DM" ? "Dungeon Master" : "Player"}
            </li>
          ))}
        </ul>
        {/* GM controls and player view can be added here */}
      </div>
    </div>
  );
}
