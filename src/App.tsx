import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();

  const [currentUser, setCurrentUser] = useState<Schema["User"]["type"] | null>(
    null
  );
  const [loadingUser, setLoadingUser] = useState(true);

  // Load or create the user entry in DynamoDB
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setLoadingUser(true);

      const email = user?.signInDetails?.loginId;
      if (!email) {
        console.error("User email not found from Cognito.");
        return;
      }
      console.log("🔍 Looking up user by email:", email);

      const all = await client.models.User.list();
      const existing = all.data.find((u) => u.email === email);

      if (existing) {
        console.log("✅ Found existing user:", existing);
        setCurrentUser(existing);
      } else {
        console.log("⚠️ No matching User entry found. Prompting for role.");
        const roleInput =
          prompt("Select your role: child, parent, or therapist") ?? "";

        if (!["child", "parent", "therapist"].includes(roleInput)) {
          alert("Invalid role. Reload and try again.");
          setLoadingUser(false);
          return;
        }

        const role = roleInput as "child" | "parent" | "therapist"; // Now it's safe!

        const newUser = await client.models.User.create({
          name: user.username ?? "No Name",
          email,
          role,
        });

        console.log("✅ Created new user:", newUser.data);
        setCurrentUser(newUser.data as Schema["User"]["type"]);
      }

      setLoadingUser(false);
    };

    loadUserData();
  }, [user]);

  // Loading state
  if (loadingUser) return <p>Loading your profile...</p>;
  if (!currentUser) return <p>Error loading user profile.</p>;

  return (
    <main>
      <h1>
        Welcome, {currentUser.name} ({currentUser.role})
      </h1>

      {currentUser.role === "therapist" && (
        <>
          <p>This is the therapist dashboard.</p>
          <button>Assign a Task (placeholder)</button>
        </>
      )}

      {currentUser.role === "parent" && (
        <>
          <p>This is the parent dashboard.</p>
          <button>View Child Progress (placeholder)</button>
        </>
      )}

      {currentUser.role === "child" && (
        <>
          <p>This is the child dashboard.</p>
          <button>Start Task or Chat (placeholder)</button>
        </>
      )}

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
