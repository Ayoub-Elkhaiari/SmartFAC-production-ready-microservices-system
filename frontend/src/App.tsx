import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import ChatWidget from "./components/common/ChatWidget";

const App = () => (
  <>
    <RouterProvider router={router} />
    <ChatWidget />
  </>
);

export default App;
