import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { getFormattedDateLetras } from '../../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    alignSelf: 'center',
    backgroundColor: '#37474F',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  orderNumberContainer: {
    marginTop: 50,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#62019f',
    marginBottom: 10,
  },
  detailsContainer: {
    fontSize: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECEFF1',
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  detailBox: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    color: '#37474F',
    fontWeight: 'bold',
  },
  badge: {
    color: '#ffffff',
    padding: 3,
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeAM: {
    backgroundColor: '#FF6F00',
  },
  badgePM: {
    backgroundColor: '#2E7D32',
  },
  tableContainer: {
    marginTop: 10,
  },
  tableTitleContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#263238',
    borderRadius: 5,
    marginBottom: 5,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#90A4AE',
    borderWidth: 1,
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#90A4AE',
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 10,
    backgroundColor: '#455A64',
    color: '#ffffff',
    paddingVertical: 5,
    textAlign: 'center',
    flex: 1.4,
    borderRightWidth: 1,
    borderColor: '#90A4AE',
  },
  tableCellItem: {
    paddingVertical: 5,
    fontSize: 9,
    flex: 0.2,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#90A4AE',
  },
  tableCell: {
    paddingVertical: 5,
    fontSize: 9,
    flex: 1.4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#90A4AE',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    fontSize: 9,
    color: '#9E9E9E',
  },
  flourSummaryContainer: {
    marginTop: 15,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFA000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flourSummaryText: {
    fontSize: 14,
    fontWeight: 'extrabold',
    color: '#5D4037',
    textAlign: 'center',
  },
  flourTotal: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#BF360C',
    marginLeft: 5,
  },
});

const OrderDetailsPdf = ({ detalleOrden, encabezadoOrden, detalleConsumo }) => {
  const panaderia = detalleOrden?.filter(item => item.idCategoria === 1);
  const reposteria = detalleOrden?.filter(item => item.idCategoria === 2);
  const fechaGeneracion = new Date().toLocaleString();

  // Calcular total de harina
  const calcularTotalHarina = () => {
    if (!detalleConsumo || detalleConsumo.length === 0) return null;
    
    const harinas = detalleConsumo.filter(item => 
      item.Ingrediente.toLowerCase().includes('harina')
    );

    if (harinas.length === 0) return null;

    const totalHarina = harinas.reduce((sum, item) => {
      return sum + parseFloat(item.CantidadUsada);
    }, 0);

    const unidad = harinas[0]?.UnidadMedida || '';

    return {
      total: totalHarina,
      unidad: unidad
    };
  };

  const totalHarina = calcularTotalHarina();

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.logoContainer}>
          <Image 
            src="https://sangabrielpiloto.vercel.app/assets/logo-Qf7fe2hw.png" 
            style={styles.logo} 
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{getFormattedDateLetras(encabezadoOrden.fechaAProducir)}</Text>
        </View>

        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumber}>ORDEN #{encabezadoOrden.idOrdenProduccion}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailBox}>
            <Text>Sucursal:</Text>
            <Text>{encabezadoOrden.nombreSucursal}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text>Turno:</Text>
            <Text
              style={[
                styles.badge,
                encabezadoOrden.ordenTurno === 'AM' ? styles.badgeAM : styles.badgePM,
              ]}
            >
              {encabezadoOrden.ordenTurno}
            </Text>
          </View>
          <View style={styles.detailBox}>
            <Text>Solicitado por:</Text>
            <Text>{encabezadoOrden.nombreUsuario}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text>Panadero:</Text>
            <Text>{encabezadoOrden.nombrePanadero}</Text>
          </View>
        </View>

        {panaderia.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={styles.tableTitleContainer}>
              <Text style={styles.tableTitle}>Productos de Panaderia</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellItem}>#</Text>
                <Text style={styles.tableHeader}>Producto</Text>
                <Text style={styles.tableHeader}>Bandejas</Text>
                <Text style={styles.tableHeader}>Unidades</Text>
              </View>
              {panaderia.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCellItem}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item.nombreProducto}</Text>
                  <Text style={styles.tableCell}>{item.cantidadBandejas || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.cantidadUnidades || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {reposteria.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={styles.tableTitleContainer}>
              <Text style={styles.tableTitle}>Productos de Reposteria</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellItem}>#</Text>
                <Text style={styles.tableHeader}>Producto</Text>
                <Text style={styles.tableHeader}>Unidades</Text>
              </View>
              {reposteria.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCellItem}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item.nombreProducto}</Text>
                  <Text style={styles.tableCell}>{item.cantidadUnidades || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {totalHarina && (
          <View style={styles.flourSummaryContainer}>
            <Text style={styles.flourSummaryText}>TOTAL HARINA NECESARIA:</Text>
            <Text style={styles.flourTotal}>
              {totalHarina.total.toFixed(2)} {totalHarina.unidad.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>Generado el {fechaGeneracion}</Text>
      </Page>
    </Document>
  );
};

export default OrderDetailsPdf;