// Enable dragging for the splitter
const splitter = document.getElementById('splitter');
const dataNavigation = document.getElementById('data-navigation');
const dataDetails = document.getElementById('data-details');
const editRecordDetails = document.getElementById('edit-record-details');
const recordTitle = document.getElementById('record-title');
const nameValue = document.getElementById('name-value');
const detailedTextValue = document.getElementById('detailedText-value');
const idValue = document.getElementById('id-value');
const parentIdValue = document.getElementById('parentId-value');
const treeLevelValue = document.getElementById('treeLevel-value');
const hasChildrenValue = document.getElementById('hasChildren-value');

splitter.addEventListener('mousedown', (e) => {
    document.body.style.cursor = 'ew-resize';
    const startX = e.clientX;
    const startWidthNav = dataNavigation.offsetWidth;
    const startWidthDetails = dataDetails.offsetWidth;

    const onMouseMove = (e) => {
        const delta = e.clientX - startX;

        // Update flex-basis of columns to adjust sizes
        dataNavigation.style.flexBasis = `${startWidthNav + delta}px`;
        dataDetails.style.flexBasis = `${startWidthDetails - delta}px`;

        // Ensure splitter remains visible
        splitter.style.width = "6px";
        splitter.style.backgroundColor = "#ddd";
    };

    const onMouseUp = () => {
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Track the selected row
let TreeView_selectedRow = null;

// Generate sample records
const generateSampleRecords = () => {
    const records = [];
    let idCounter = 1;

    // Create parent records
    for (let i = 1; i <= 5; i++) {
        const record = {
            id: idCounter++,
            name: `Parent Node ${i}`,
            parentId: 0,
            treeLevel: 1,
            hasChildren: Math.random() > 0.5 ? 1 : 0,
            detailedText: `Parent Node ${i}`,
            customSort: 0
        };
        records.push(record);
    }

    // Create child and grandchild records
    records.forEach(parent => {
        if (parent.hasChildren) {
            const numberOfChildren = Math.floor(Math.random() * 4) + 2; // 2-5 children
            for (let i = 1; i <= numberOfChildren; i++) {
                const child = {
                    id: idCounter++,
                    name: `Child of ${parent.name} - ${i}`,
                    parentId: parent.id,
                    treeLevel: 2,
                    hasChildren: Math.random() > 0.5 ? 1 : 0,
                    detailedText: `Child of ${parent.name} - ${i}`,
                    customSort: 0
                };
                records.push(child);

                if (child.hasChildren) {
                    const numberOfGrandChildren = Math.floor(Math.random() * 3) + 1; // 1-3 grandchildren
                    for (let j = 1; j <= numberOfGrandChildren; j++) {
                        records.push({
                            id: idCounter++,
                            name: `Grandchild of ${child.name} - ${j}`,
                            parentId: child.id,
                            treeLevel: 3,
                            hasChildren: 0,
                            detailedText: `Grandchild of ${child.name} - ${j}`,
                            customSort: 0
                        });
                    }
                }
            }
        }
    });

    return records;
};

const createRow = (record, indent = 0) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.marginLeft = `${indent * 20}px`;
    row.dataset.recordId = record.id;
    row.dataset.treeLevel = record.treeLevel;

    // Attach the entire record to the row
    row.record = record;

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24');
    arrow.setAttribute('width', '16');
    arrow.setAttribute('height', '16');
    arrow.innerHTML = '<path d="M8 5l8 7-8 7z" fill="black"></path>';
    if (record.hasChildren === 0) {
        arrow.classList.add('invisible');
    }

    arrow.addEventListener('click', () => {
        const isRight = arrow.style.transform === '' || arrow.style.transform === 'rotate(0deg)';
        const parentId = parseInt(row.dataset.recordId);

        if (isRight) {
            arrow.style.transform = 'rotate(90deg)';
            const childRecords = records.filter(r => r.parentId === parentId);
            childRecords.sort((a, b) => a.name.localeCompare(b.name));
            let lastInsertedRow = row;
            childRecords.forEach(childRecord => {
                const childRow = createRow(childRecord, parseInt(row.dataset.treeLevel));
                lastInsertedRow.parentNode.insertBefore(childRow, lastInsertedRow.nextSibling);
                lastInsertedRow = childRow;
            });
        } else {
            arrow.style.transform = 'rotate(0deg)';
            const treeLevel = parseInt(row.dataset.treeLevel);
            let sibling = row.nextSibling;
            while (sibling && parseInt(sibling.dataset.treeLevel) > treeLevel) {
                const nextSibling = sibling.nextSibling;
                sibling.remove();
                sibling = nextSibling;
            }
        }
    });

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = record.name;

    label.addEventListener('click', () => {
        // Revert background color of previously selected row
        if (TreeView_selectedRow) {
            TreeView_selectedRow.style.backgroundColor = '';
        }

        // Highlight the currently selected row
        TreeView_selectedRow = row;
        row.style.backgroundColor = 'lightblue';

        // Show edit record details
        editRecordDetails.style.display = 'table';
        recordTitle.textContent = `Details for ${record.name}`;
        nameValue.value = record.name;
        detailedTextValue.textContent = record.detailedText;
        idValue.textContent = record.id;
        parentIdValue.value = record.parentId;
        treeLevelValue.textContent = record.treeLevel;
        hasChildrenValue.textContent = record.hasChildren;
    });

    row.appendChild(arrow);
    row.appendChild(label);
    return row;
};

const populateTable = (records) => {
    const tableBody = document.querySelector('#data-table tbody');
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.name}</td>
            <td>${record.parentId}</td>
            <td>${record.treeLevel}</td>
            <td>${record.hasChildren}</td>
            <td>${record.detailedText}</td>
            <td>${record.customSort}</td>
        `;
        tableBody.appendChild(row);
    });
};

const records = generateSampleRecords();
const rootRecords = records.filter(record => record.parentId === 0);

// Populate tree-container
const container = document.getElementById('tree-container');
rootRecords.forEach(record => {
    const row = createRow(record);
    container.appendChild(row);
});

// Populate data-table
populateTable(records);