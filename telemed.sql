-- Function to generate UUID in BINARY(16) format for uniqueness. am seeing the app grow to millins of records
DELIMITER //
CREATE FUNCTION uuid_to_bin(uuid CHAR(36)) RETURNS BINARY(16) DETERMINISTIC
BEGIN
    RETURN UNHEX(REPLACE(uuid, '-', ''));
END//
DELIMITER ;

-- Patients Table: stores patient information
CREATE TABLE Patients (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Specializations Table: normalizes doctor specializations
CREATE TABLE Specializations (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    specialization_name VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Doctors Table: references Specializations to normalize specializations
CREATE TABLE Doctors (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization_id BINARY(16) NOT NULL, -- FK to Specializations
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (specialization_id) REFERENCES Specializations(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- DoctorSchedule Table: allows flexibility in doctor's availability
CREATE TABLE DoctorSchedule (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    doctor_id BINARY(16) NOT NULL,
    available_day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Appointments Table: references Patients and Doctors
CREATE TABLE Appointments (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    patient_id BINARY(16) NOT NULL,
    doctor_id BINARY(16) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'canceled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Admin Table: handles admin credentials and roles
CREATE TABLE Admin (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(UUID())),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create the trigger for UUID generation
DELIMITER //
CREATE TRIGGER before_insert_patients
BEFORE INSERT ON Patients
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_specializations
BEFORE INSERT ON Specializations
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_doctors
BEFORE INSERT ON Doctors
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_doctor_schedule
BEFORE INSERT ON DoctorSchedule
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_appointments
BEFORE INSERT ON Appointments
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_admin
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = uuid_to_bin(UUID());
    END IF;
END//
DELIMITER ;
