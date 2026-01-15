let allCategories = new Set();
let categoryOwners = {};

function updateCategorySelect() {
  const select = document.getElementById('categorySelect');
  const defaultOption = select.options[0];
  select.innerHTML = '';
  select.appendChild(defaultOption);

  Array.from(allCategories).sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const customOption = document.createElement('option');
  customOption.value = '__custom__';
  customOption.textContent = '+ Create New Category';
  select.appendChild(customOption);
}

document.getElementById('categorySelect').addEventListener('change', (e) => {
  const newCategoryInput = document.getElementById('newCategoryInput');
  newCategoryInput.style.display = e.target.value === '__custom__' ? 'block' : 'none';
});

export { allCategories, categoryOwners, updateCategorySelect };
