import React from 'react';
import Image from 'next/image';

// Figma MCP-generated Wave2 component
// Uses Tailwind CSS for styling

const imgIcon = "https://www.figma.com/api/mcp/asset/c7475658-600f-41fa-a5f3-c44a03cc387e";
const imgIcon1 = "https://www.figma.com/api/mcp/asset/b3a61f49-f0fc-4948-99d6-94a8e6ce4a22";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/cfc2e541-64eb-4222-8be2-d4f9deb59826";
const imgIcon3 = "https://www.figma.com/api/mcp/asset/c0f65f0d-ceab-4244-b014-d12b23f52a89";
const imgIcon4 = "https://www.figma.com/api/mcp/asset/2047d425-3fcd-47bd-a401-132cfde51a63";
const imgIcon5 = "https://www.figma.com/api/mcp/asset/ee00ad4f-8b5d-4d94-ad3e-cbf4b43d4af0";
const imgIcon6 = "https://www.figma.com/api/mcp/asset/c8f02ba6-6577-4c44-90ba-38eab41ab2c5";
const imgIcon7 = "https://www.figma.com/api/mcp/asset/101e6d9b-1d5c-4836-88f8-8c05cd587b14";
const imgIcon8 = "https://www.figma.com/api/mcp/asset/425787a6-0590-433d-8193-17a5967f37cb";
const imgGroup = "https://www.figma.com/api/mcp/asset/3c733528-cff5-4107-84b9-b098598cae07";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/4b851bcb-78dd-4683-8ee8-2fa4812eac0b";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/063b536f-d4e0-4a5b-96fd-9258a8a8b51c";
const imgIcon9 = "https://www.figma.com/api/mcp/asset/ebac01f9-f64f-436c-bcf4-d47e39a05715";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/ab43a12e-6678-43ad-8e2d-14b36dbddf8d";
const imgIcon10 = "https://www.figma.com/api/mcp/asset/2ae1e205-7bf4-4a9d-8005-f7d026bfb233";
const imgIcon11 = "https://www.figma.com/api/mcp/asset/822ac06d-fd4e-40c4-b18d-c270138ad786";
const imgIcon12 = "https://www.figma.com/api/mcp/asset/9ac02134-667f-4a3a-99e1-79608dfd8be1";
const imgVector = "https://www.figma.com/api/mcp/asset/8c636147-9396-4ece-a170-161cf9b38b18";
const imgVector1 = "https://www.figma.com/api/mcp/asset/7f553673-e380-4295-994e-cc39cad581a7";
const imgVector2 = "https://www.figma.com/api/mcp/asset/6b60df47-1805-4156-be4c-2b0bcf02dd64";
const imgVector3 = "https://www.figma.com/api/mcp/asset/8b06dc11-9f7e-4e95-a9ff-20612b6c803a";
const imgVector4 = "https://www.figma.com/api/mcp/asset/3e7f96f9-92da-4024-8c8b-d8087db25e2e";
const imgIcon13 = "https://www.figma.com/api/mcp/asset/e8c9b0e9-0f3a-4972-846c-7e6368925d20";
const imgIcon14 = "https://www.figma.com/api/mcp/asset/e951c45d-e1e2-4f36-beef-e926f2e4e13d";
const imgIcon15 = "https://www.figma.com/api/mcp/asset/2b640cb8-1bf9-4a26-b860-262ba261aa68";
const imgIcon16 = "https://www.figma.com/api/mcp/asset/9dc08bac-a0a8-43e2-b4b5-63022e544dc6";
const imgIcon17 = "https://www.figma.com/api/mcp/asset/2dfcd586-34bc-453f-af2c-6fc931eff65f";

export default function Wave2() {
  return (
    <div className="bg-white relative size-full" data-name="Wave 2" data-node-id="1:3">
      <div className="absolute left-[264px] top-0 right-0 bottom-0">
        <div className="bg-white relative size-full" data-name="Window" data-node-id="1:4">
          {/* Header */}
          <div className="absolute left-0 top-0 w-full h-[72px] bg-white border-b border-[#E4E4E7]" data-name="Header" data-node-id="1:5">
            <div className="flex items-center justify-between px-8 h-full">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-[#18181B]">Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Image src={imgIcon} alt="Settings" width={20} height={20} className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="absolute left-8 top-[96px] right-8 h-[132px]" data-name="Stats" data-node-id="1:40">
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* Active Units */}
              <div className="bg-white border border-[#E4E4E7] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#71717A] mb-1">Active Units</p>
                    <p className="text-2xl font-semibold text-[#18181B]">12</p>
                  </div>
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                    <Image src={imgIcon1} alt="Units" width={20} height={20} className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <span className="text-xs text-[#059669]">+20.1%</span>
                  <span className="text-xs text-[#71717A]">from last month</span>
                </div>
              </div>

              {/* Events Published */}
              <div className="bg-white border border-[#E4E4E7] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#71717A] mb-1">Events Published</p>
                    <p className="text-2xl font-semibold text-[#18181B]">2,350</p>
                  </div>
                  <div className="w-10 h-10 bg-[#F0FDF4] rounded-lg flex items-center justify-center">
                    <Image src={imgIcon2} alt="Views" width={20} height={20} className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <span className="text-xs text-[#059669]">+180.1%</span>
                  <span className="text-xs text-[#71717A]">from last month</span>
                </div>
              </div>

              {/* Total Views */}
              <div className="bg-white border border-[#E4E4E7] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#71717A] mb-1">Total Views</p>
                    <p className="text-2xl font-semibold text-[#18181B]">12,234</p>
                  </div>
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                    <Image src={imgIcon3} alt="Prechecks" width={20} height={20} className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <span className="text-xs text-[#059669]">+19%</span>
                  <span className="text-xs text-[#71717A]">from last month</span>
                </div>
              </div>

              {/* Pending Reviews */}
              <div className="bg-white border border-[#E4E4E7] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#71717A] mb-1">Pending Reviews</p>
                    <p className="text-2xl font-semibold text-[#18181B]">573</p>
                  </div>
                  <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
                    <Image src={imgIcon4} alt="Score" width={20} height={20} className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <span className="text-xs text-[#059669]">+201%</span>
                  <span className="text-xs text-[#71717A]">from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="absolute left-8 top-[252px] right-8 h-[360px]" data-name="Analytics" data-node-id="1:148">
            <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#18181B]">Analytics Overview</h3>
                <button className="text-sm text-[#3B82F6] hover:text-[#2563EB]">View all</button>
              </div>
              
              <div className="relative h-[280px] bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                <Image src={imgGroup} alt="Analytics Chart" width={400} height={300} className="max-w-full max-h-full" />
              </div>
            </div>
          </div>

          {/* Funnel Analysis */}
          <div className="absolute left-8 top-[636px] right-8 h-[400px]" data-name="Funnel" data-node-id="1:214">
            <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#18181B]">Funnel Analysis</h3>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-[#E4E4E7] rounded-md px-3 py-1">
                    <option>Last 30 days</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">1</span>
                    </div>
                    <span className="text-sm font-medium text-[#18181B]">Page Views</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#18181B]">12,234</p>
                    <p className="text-xs text-[#71717A]">100%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">2</span>
                    </div>
                    <span className="text-sm font-medium text-[#18181B]">Event Clicks</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#18181B]">8,456</p>
                    <p className="text-xs text-[#71717A]">69.1%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">3</span>
                    </div>
                    <span className="text-sm font-medium text-[#18181B]">Profile Views</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#18181B]">3,421</p>
                    <p className="text-xs text-[#71717A]">28.0%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#EF4444] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">4</span>
                    </div>
                    <span className="text-sm font-medium text-[#18181B]">Conversions</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#18181B]">573</p>
                    <p className="text-xs text-[#71717A]">4.7%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Units Table */}
          <div className="absolute left-8 top-[1060px] right-8 h-[400px]" data-name="UnitsTable" data-node-id="1:337">
            <div className="bg-white border border-[#E4E4E7] rounded-lg h-full">
              <div className="p-6 border-b border-[#E4E4E7]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#18181B]">Recent Units</h3>
                  <button className="text-sm text-[#3B82F6] hover:text-[#2563EB]">View all</button>
                </div>
              </div>
              
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E4E4E7]">
                      <th className="text-left text-xs font-medium text-[#71717A] pb-3">Unit</th>
                      <th className="text-left text-xs font-medium text-[#71717A] pb-3">Status</th>
                      <th className="text-left text-xs font-medium text-[#71717A] pb-3">Events</th>
                      <th className="text-left text-xs font-medium text-[#71717A] pb-3">Views</th>
                      <th className="text-left text-xs font-medium text-[#71717A] pb-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7]">
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">A1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#18181B]">Alpha Unit</p>
                            <p className="text-xs text-[#71717A]">Military Operations</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-[#DCFCE7] text-[#059669] rounded-full">Active</span>
                      </td>
                      <td className="py-4 text-sm text-[#18181B]">234</td>
                      <td className="py-4 text-sm text-[#18181B]">1,234</td>
                      <td className="py-4 text-sm text-[#71717A]">2 hours ago</td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">B2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#18181B]">Bravo Unit</p>
                            <p className="text-xs text-[#71717A]">Training Division</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-[#DCFCE7] text-[#059669] rounded-full">Active</span>
                      </td>
                      <td className="py-4 text-sm text-[#18181B]">187</td>
                      <td className="py-4 text-sm text-[#18181B]">892</td>
                      <td className="py-4 text-sm text-[#71717A]">4 hours ago</td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">C3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#18181B]">Charlie Unit</p>
                            <p className="text-xs text-[#71717A]">Support Operations</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-[#FEF3C7] text-[#D97706] rounded-full">Pending</span>
                      </td>
                      <td className="py-4 text-sm text-[#18181B]">156</td>
                      <td className="py-4 text-sm text-[#18181B]">623</td>
                      <td className="py-4 text-sm text-[#71717A]">1 day ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Precheck Inbox */}
          <div className="absolute left-8 top-[1484px] right-8 h-[300px]" data-name="Inbox" data-node-id="1:484">
            <div className="bg-white border border-[#E4E4E7] rounded-lg h-full">
              <div className="p-6 border-b border-[#E4E4E7]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#18181B]">Precheck Inbox</h3>
                  <span className="text-sm text-[#71717A]">3 pending</span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4 p-4 border border-[#E4E4E7] rounded-lg">
                  <div className="w-2 h-2 bg-[#EF4444] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#18181B]">High Priority Review</p>
                      <span className="text-xs text-[#71717A]">2 min ago</span>
                    </div>
                    <p className="text-sm text-[#71717A] mt-1">Alpha Unit requires immediate attention for security clearance update.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-[#E4E4E7] rounded-lg">
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#18181B]">Equipment Check</p>
                      <span className="text-xs text-[#71717A]">1 hour ago</span>
                    </div>
                    <p className="text-sm text-[#71717A] mt-1">Bravo Unit equipment inventory needs verification before deployment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-[#E4E4E7] rounded-lg">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#18181B]">Training Completion</p>
                      <span className="text-xs text-[#71717A]">3 hours ago</span>
                    </div>
                    <p className="text-sm text-[#71717A] mt-1">Charlie Unit has completed mandatory training requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="absolute left-0 top-0 w-[264px] h-full bg-[#18181B]" data-name="Sidebar" data-node-id="1:570">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Image src={imgIcon5} alt="Menu" width={16} height={16} className="w-4 h-4" />
            </div>
            <span className="text-white font-semibold">Fairvia</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#3B82F6] text-white rounded-lg">
              <Image src={imgIcon6} alt="View" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon7} alt="Export" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Units</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon8} alt="Settings" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Events</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon9} alt="Timeline" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon10} alt="Archive" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Reports</span>
            </a>
          </nav>

          {/* Settings */}
          <div className="mt-8 pt-8 border-t border-[#27272A]">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon11} alt="Analytics" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg">
              <Image src={imgIcon12} alt="Configuration" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium">Help</span>
            </a>
          </div>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 bg-[#27272A] rounded-lg">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-[#A1A1AA]">admin@fairvia.com</p>
            </div>
            <Image src={imgIcon13} alt="Menu" width={16} height={16} className="w-4 h-4 text-[#A1A1AA]" />
          </div>
        </div>
      </div>
    </div>
  );
}