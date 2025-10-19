import { getAccount, setAccount } from "./common.js";

// Check for cached Instagram account name
window.addEventListener('DOMContentLoaded', async () => {
  const accountModal = document.getElementById('accountModal');
  const accountInput = document.getElementById('accountInput');
  const accountForm = document.getElementById('accountForm');

  const account = await getAccount();

  if (!account) {
    accountModal.showModal();
  }

  accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = accountInput.value.trim();
    if (value) {
      setAccount(value)
      accountModal.close();
    }
  });
});
