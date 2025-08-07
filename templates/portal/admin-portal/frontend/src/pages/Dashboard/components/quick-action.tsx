import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bolt, Plus, Mail, FileText, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import AddContactDialog from "@/pages/Contacts/ContactListPage/components/add-contact-dialog";
import { NewContributionDialog } from "@/pages/Contributions/ContributionListPage/components/new-contribution-dialog";

export default function QuickActionsDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("Individual");
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Add Contact Dialog */}
      <AddContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        currentTab={currentTab}
        onCurrentTabChange={setCurrentTab} canAddOrganizations={false} canAddIndividuals={false}      />

      {/* New Contribution Dialog */}
      <NewContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        hideTrigger={true}
      />

      <div className="relative inline-block text-left" ref={dropdownRef}>
        <Button
          onClick={() => setDropdownOpen((o) => !o)}
          variant="outline"
          className="flex items-center gap-2 text-sky-700"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <Bolt className="w-5 h-5" />
          Quick Actions
        </Button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <ul className="py-1">
              <li>
                <Button
                  variant="ghost"
                  className="w-full flex-wrap justify-start gap-2 text-slate-700"
                  onClick={() => {
                    setCurrentTab("Individual");
                    setDropdownOpen(false);
                    setTimeout(() => setContactDialogOpen(true), 50);
                  }}
                >
                  <Plus className="w-5 h-5 text-sky-700" />
                  Add New Donor
                </Button>
              </li>

              <li>
                <Button
                  variant="ghost"
                  className="w-full flex-wrap justify-start gap-2 text-slate-700"
                  onClick={() => {
                    setDropdownOpen(false);
                    setTimeout(() => setContributionDialogOpen(true), 50);
                  }}
                >
                  <CreditCard className="w-5 h-5 text-sky-700" />
                  Log New Contribution
                </Button>
              </li>

              <li>
                <Link to="/contacts" onClick={() => setDropdownOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full flex-wrap justify-start gap-2 text-slate-700"
                  >
                    <Mail className="w-5 h-5 text-sky-700" />
                    Send Email
                  </Button>
                </Link>
              </li>

              <li>
                <Link to="/contributions" onClick={() => setDropdownOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full flex-wrap justify-start gap-2 text-slate-700"
                  >
                    <FileText className="w-5 h-5 text-sky-700" />
                    Generate Report
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
