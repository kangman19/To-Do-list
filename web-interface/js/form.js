    const taskSelect = document.getElementById('taskSelect');
    const textFieldset = document.getElementById('textFieldset');
    const imageFieldset = document.getElementById('imageFieldset');

    taskSelect.addEventListener('change', () => {
    const type = taskSelect.value;

    textFieldset.style.display = 'none';
    imageFieldset.style.display = 'none';

    if (type === 'text') {
        textFieldset.style.display = 'block';
    } else if (type === 'image') {
        imageFieldset.style.display = 'block';
    }
});
