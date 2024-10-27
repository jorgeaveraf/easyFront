import pyodbc

# Configuración de la conexión
server = 'localhost'  # o dirección IP del servidor si está en otra máquina
database = 'EasyEnroll'   # base de datos predeterminada
username = 'sa'       # usuario SA (o el que hayas creado)
password = 'zS22004347'  # contraseña del usuario

# Crear la conexión
try:
    connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
                                'SERVER=' + server + ';'
                                'DATABASE=' + database + ';'
                                'UID=' + username + ';'
                                'PWD=' + password)
    print("Conexión exitosa a la base de datos.")
    
    # Ejecutar una consulta de prueba
    cursor = connection.cursor()
    cursor.execute("SELECT @@VERSION;")
    row = cursor.fetchone()
    print("Versión de SQL Server:", row[0])

except Exception as e:
    print("Error al conectar a la base de datos:", e)
finally:
    connection.close()
