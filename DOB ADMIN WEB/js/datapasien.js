class PatientManager {
    constructor() {
        this.initializeElements();
        this.initializeModals();
        this.initializeEventListeners();
        this.loadPatients();
    }

    initializeElements() {
        this.patientsTable = document.getElementById('patients-table');
        this.addPatientButton = document.getElementById('add-patient-button');
        this.confirmDeleteButton = document.getElementById('confirm-delete-button');
        this.currentPatientId = null;
    }

    initializeModals() {
        this.addModal = new bootstrap.Modal(document.getElementById('add-patient-modal'));
        this.editModal = new bootstrap.Modal(document.getElementById('edit-patient-modal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('delete-patient-modal'));
    }

    initializeEventListeners() {
        // Add patient button handler
        if (this.addPatientButton) {
            this.addPatientButton.addEventListener('click', () => this.addModal.show());
        }

        // Add patient form handler
        const addForm = document.getElementById('add-patient-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddPatient(e));
        }

        // Edit patient form handler
        const editForm = document.getElementById('edit-patient-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditPatient(e));
        }

        // Table click handlers for edit and delete
        if (this.patientsTable) {
            this.patientsTable.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('edit-button')) {
                    this.currentPatientId = target.dataset.id;
                    this.populateEditModal(this.currentPatientId);
                } else if (target.classList.contains('delete-button')) {
                    this.currentPatientId = target.dataset.id;
                    this.deleteModal.show();
                }
            });
        }

        // Delete confirmation handler
        if (this.confirmDeleteButton) {
            this.confirmDeleteButton.addEventListener('click', () => this.handleDeletePatient());
        }

        // Modal close handlers
        ['add', 'edit', 'delete'].forEach(type => {
            const closeButton = document.getElementById(`close-${type}-modal`);
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this[`${type}Modal`].hide();
                    if (type === 'edit' || type === 'delete') {
                        this.currentPatientId = null;
                    }
                });
            }
        });
    }

    async loadPatients() {
        try {
            const token = this.getAuthToken();
            console.log('Loading patients with token:', token);

            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/pasien/bulk', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const patients = await response.json();
            console.log('Received patients data:', patients);

            if (this.dataTable) {
                this.dataTable.destroy();
            }

            if (Array.isArray(patients) && patients.length > 0) {
                this.dataTable = new simpleDatatables.DataTable(this.patientsTable, {
                    data: {
                        headings: ["Nama", "Usia", "Jenis Kelamin", "Tanggal Masuk", "Berat Badan", "Golongan Darah", "Tinggi Badan", "Aksi"],
                        data: patients.map(patient => ([
                            patient.nama,
                            patient.usia.toString(),
                            patient.jenis_kelamin,
                            patient.tanggal_masuk ? patient.tanggal_masuk.split('T')[0] : '',
                            patient.bb.toString(),
                            patient.gol_darah,
                            patient.tb.toString(),
                            `<button class="btn btn-primary btn-sm edit-button" data-id="${patient.id_pasien}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm delete-button" data-id="${patient.id_pasien}">
                                <i class="fas fa-trash"></i> Delete
                            </button>`
                        ]))
                    }
                });
            } else {
                this.dataTable = new simpleDatatables.DataTable(this.patientsTable);
            }
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            this.showAlert('error', 'Gagal memuat data pasien');
        }
    }

    async populateEditModal(patientId) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${patientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const patient = await response.json();

            // Populate form fields
            const fields = ['nama', 'usia', 'jenis_kelamin', 'bb', 'gol_darah', 'tb'];
            fields.forEach(field => {
                const input = document.getElementById(`edit-${field}`);
                if (input) {
                    input.value = patient[field];
                }
            });

            // Handle tanggal_masuk separately due to date formatting
            const dateInput = document.getElementById('edit-tanggal-masuk');
                if (dateInput && patient.tanggal_masuk) {
                    dateInput.value = patient.tanggal_masuk.split('T')[0];
                }


            this.editModal.show();
        } catch (error) {
            console.error('Failed to fetch patient details:', error);
            this.showAlert('error', 'Gagal memuat detail pasien');
        }
    }

    async handleAddPatient(event) {
        event.preventDefault();
        try {
            const formData = this.getFormData('add');
            const token = this.getAuthToken();

            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/pasien', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.addModal.hide();
            event.target.reset();
            this.showAlert('success', 'Pasien berhasil ditambahkan');
            await this.loadPatients();
        } catch (error) {
            console.error('Failed to add patient:', error);
            this.showAlert('error', 'Gagal menambahkan pasien');
        }
    }

    async handleEditPatient(event) {
        event.preventDefault();
        try {
            const formData = this.getFormData('edit');
            const token = this.getAuthToken();

            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${this.currentPatientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.editModal.hide();
            this.currentPatientId = null;
            this.showAlert('success', 'Data pasien berhasil diperbarui');
            await this.loadPatients();
        } catch (error) {
            console.error('Failed to update patient:', error);
            this.showAlert('error', 'Gagal memperbarui data pasien');
        }
    }

    async handleDeletePatient() {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${this.currentPatientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.deleteModal.hide();
            this.currentPatientId = null;
            this.showAlert('success', 'Pasien berhasil dihapus');
            await this.loadPatients();
        } catch (error) {
            console.error('Failed to delete patient:', error);
            this.showAlert('error', 'Gagal menghapus pasien');
        }
    }

    getFormData(prefix) {
        return {
            nama: document.getElementById(`${prefix}-nama`).value,
            usia: parseInt(document.getElementById(`${prefix}-usia`).value),
            jenis_kelamin: document.getElementById(`${prefix}-jenis-kelamin`).value,
            tanggal_masuk: document.getElementById(`${prefix}-tanggal-masuk`).value,
            bb: parseFloat(document.getElementById(`${prefix}-bb`).value),
            gol_darah: document.getElementById(`${prefix}-gol-darah`).value,
            tb: parseFloat(document.getElementById(`${prefix}-tb`).value)
        };
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PatientManager();
});